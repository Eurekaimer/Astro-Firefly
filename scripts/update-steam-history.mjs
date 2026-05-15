import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const historyPath = path.join(rootDir, "src/data/steam-history.json");
const siteConfigPath = path.join(rootDir, "src/config/siteConfig.ts");
const apiBaseUrl = "https://api.steampowered.com/IPlayerService";
const requestTimeoutMs = 15000;
const maxAttempts = 3;
const maxSnapshots = 370;
const timeZone = process.env.STEAM_HISTORY_TIMEZONE || "Asia/Shanghai";

function parseEnvValue(value) {
	const trimmed = value.trim();
	if (
		(trimmed.startsWith('"') && trimmed.endsWith('"')) ||
		(trimmed.startsWith("'") && trimmed.endsWith("'"))
	) {
		return trimmed.slice(1, -1);
	}
	return trimmed;
}

async function loadEnvFile(filename) {
	try {
		const content = await readFile(path.join(rootDir, filename), "utf8");
		for (const line of content.split(/\r?\n/)) {
			const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
			if (!match || line.trim().startsWith("#")) continue;

			const [, key, rawValue] = match;
			if (!process.env[key]) {
				process.env[key] = parseEnvValue(rawValue);
			}
		}
	} catch (error) {
		if (error?.code !== "ENOENT") {
			console.warn(`[Steam History] 读取 ${filename} 失败，已跳过。`);
		}
	}
}

async function getSteamId() {
	if (process.env.STEAM_ID?.trim()) {
		return process.env.STEAM_ID.trim();
	}

	const siteConfig = await readFile(siteConfigPath, "utf8");
	const steamConfigMatch = siteConfig.match(/steam:\s*{[\s\S]*?}/);
	const steamIdMatch = steamConfigMatch?.[0].match(/steamId:\s*["']([^"']+)["']/);
	return steamIdMatch?.[1]?.trim() || "";
}

function getDateKey(date = new Date()) {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(date);
	const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
	return `${values.year}-${values.month}-${values.day}`;
}

async function fetchJsonWithRetry(url, label) {
	let lastError;

	for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
		try {
			const response = await fetch(url, {
				signal: AbortSignal.timeout(requestTimeoutMs),
			});
			if (!response.ok) {
				throw new Error(`${label} failed with ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			lastError = error;
			if (attempt < maxAttempts) {
				await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
			}
		}
	}

	throw lastError;
}

async function fetchSteamJson(method, params) {
	const url = new URL(`${apiBaseUrl}/${method}/v0001/`);
	for (const [key, value] of Object.entries(params)) {
		url.searchParams.set(key, value);
	}
	url.searchParams.set("format", "json");

	return fetchJsonWithRetry(url, method);
}

async function readHistory() {
	try {
		const content = await readFile(historyPath, "utf8");
		const parsed = JSON.parse(content);
		return Array.isArray(parsed) ? parsed : [];
	} catch (error) {
		if (error?.code !== "ENOENT") {
			console.warn("[Steam History] 历史文件读取失败，将重新生成。");
		}
		return [];
	}
}

async function writeHistory(history) {
	await writeFile(historyPath, `${JSON.stringify(history, null, 2)}\n`, "utf8");
}

async function main() {
	await loadEnvFile(".env.local");
	await loadEnvFile(".env");

	const steamApiKey = process.env.STEAM_API_KEY?.trim();
	const steamId = await getSteamId();

	if (!steamApiKey || !steamId) {
		console.warn("[Steam History] 缺少 STEAM_API_KEY 或 Steam ID，跳过快照更新。");
		return;
	}

	const [ownedData, recentData] = await Promise.all([
		fetchSteamJson("GetOwnedGames", {
			key: steamApiKey,
			steamid: steamId,
			include_appinfo: "true",
			include_played_free_games: "true",
		}),
		fetchSteamJson("GetRecentlyPlayedGames", {
			key: steamApiKey,
			steamid: steamId,
			count: "100",
		}),
	]);

	const games = ownedData.response?.games || [];
	const totalPlayMinutes = games.reduce(
		(total, game) => total + (game.playtime_forever || 0),
		0,
	);
	const recentPlayMinutes = (recentData.response?.games || []).reduce(
		(total, game) => total + (game.playtime_2weeks || 0),
		0,
	);
	const playedGames = games.filter((game) => (game.playtime_forever || 0) > 0);
	const topGame = [...playedGames].sort(
		(a, b) => (b.playtime_forever || 0) - (a.playtime_forever || 0),
	)[0];

	const snapshot = {
		date: getDateKey(),
		recordedAt: new Date().toISOString(),
		totalPlayMinutes,
		recentPlayMinutes,
		gameCount: games.length,
		playedGameCount: playedGames.length,
		topGame: topGame
			? {
					appid: topGame.appid,
					name: topGame.name,
					playtime_forever: topGame.playtime_forever || 0,
				}
			: undefined,
	};

	const history = await readHistory();
	const nextHistory = [
		...history.filter((item) => item?.date !== snapshot.date),
		snapshot,
	]
		.filter((item) => item?.date && Number.isFinite(item.totalPlayMinutes))
		.sort((a, b) => a.date.localeCompare(b.date))
		.slice(-maxSnapshots);

	await writeHistory(nextHistory);
	console.log(
		`[Steam History] 已更新 ${snapshot.date} 快照：${Math.round(totalPlayMinutes / 60)} 小时。`,
	);
}

main().catch((error) => {
	console.warn("[Steam History] 快照更新失败，继续使用已有历史。", error);
});
