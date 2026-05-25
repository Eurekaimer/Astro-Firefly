import fs from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const defaultKomaBellDir = path.resolve(repoRoot, "..", "koma-bell");
const komaBellDir = path.resolve(process.env.KOMA_BELL_DIR || defaultKomaBellDir);
const subscriptionsPath = path.resolve(
	process.env.KOMA_BELL_SUBSCRIPTIONS_PATH ||
		path.join(komaBellDir, "subscriptions.yml"),
);
const outputPath = path.join(repoRoot, "src/data/bangumi-manga-progress.json");

const stateCandidates = [
	process.env.KOMA_BELL_STATE_PATH,
	path.join(komaBellDir, "state.json"),
	path.join(
		process.env.XDG_STATE_HOME ||
			path.join(process.env.USERPROFILE || process.env.HOME || "", ".local", "state"),
		"koma-bell",
		"state.json",
	),
].filter(Boolean);

function parseScalar(value) {
	const trimmed = value.trim();
	if (
		(trimmed.startsWith('"') && trimmed.endsWith('"')) ||
		(trimmed.startsWith("'") && trimmed.endsWith("'"))
	) {
		return trimmed.slice(1, -1);
	}
	return trimmed;
}

function assignYamlField(target, line) {
	const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
	if (!match) return;
	target[match[1]] = parseScalar(match[2] || "");
}

function parseSubscriptionsYaml(content) {
	const items = [];
	let current = null;

	for (const rawLine of content.split(/\r?\n/)) {
		if (!rawLine.trim() || rawLine.trimStart().startsWith("#")) continue;

		const line = rawLine.replace(/\s+#.*$/, "").trimEnd();
		const itemMatch = line.match(/^\s*-\s*(.*)$/);
		if (itemMatch) {
			if (current) items.push(current);
			current = {};
			if (itemMatch[1]) assignYamlField(current, itemMatch[1]);
			continue;
		}

		if (current && /^\s+/.test(rawLine)) {
			assignYamlField(current, line.trim());
		}
	}

	if (current) items.push(current);

	return items.filter((item) => item.id && item.url);
}

async function readJsonIfExists(candidates) {
	for (const candidate of candidates) {
		try {
			const content = await fs.readFile(candidate, "utf8");
			return {
				path: candidate,
				data: JSON.parse(content),
			};
		} catch (error) {
			if (error.code !== "ENOENT") {
				console.warn(`[koma-bell] Cannot read state ${candidate}: ${error.message}`);
			}
		}
	}
	return { path: "", data: null };
}

async function main() {
	let subscriptionsContent;
	try {
		subscriptionsContent = await fs.readFile(subscriptionsPath, "utf8");
	} catch (error) {
		if (error.code === "ENOENT") {
			console.warn(
				`[koma-bell] ${subscriptionsPath} not found; keeping existing manga progress snapshot.`,
			);
			return;
		}
		throw error;
	}

	const subscriptions = parseSubscriptionsYaml(subscriptionsContent);
	const state = await readJsonIfExists(stateCandidates);
	const comics = state.data?.comics || {};

	const items = subscriptions.map((subscription) => {
		const comicState = comics[subscription.id] || {};
		return {
			id: subscription.id,
			name: subscription.name || comicState.title || subscription.id,
			url: subscription.url,
			source: "koma-bell",
			latestChapterTitle: comicState.latest_chapter_title || "",
			latestChapterUrl: comicState.latest_chapter_url || "",
			checkedAt: comicState.checked_at || "",
			progressVol: 0,
			totalVol: 0,
		};
	});

	const output = {
		source: "koma-bell",
		sourcePath: path.relative(repoRoot, subscriptionsPath).replaceAll("\\", "/"),
		statePath: state.path ? path.relative(repoRoot, state.path).replaceAll("\\", "/") : "",
		updatedAt: new Date().toISOString(),
		total: items.length,
		items,
	};

	await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
	console.log(`[koma-bell] Synced ${items.length} manga subscriptions to ${outputPath}.`);
}

await main();
