import fs from "node:fs";
import path from "node:path";
import type { GalleryAlbum } from "@/types/config";

/**
 * 获取经过修正的 Base URL
 */
function getNormalizedBase(): string {
	// 获取 Astro 配置的 base，如果没有则默认为 /
	const base = import.meta.env.BASE_URL || "/";
	// 确保以 / 开头，且末尾没有冗余的 /
	return base.endsWith("/") ? base.slice(0, -1) : base;
}

/**
 * 扫描相册目录中的所有图片文件
 */
export function scanAlbumPhotos(albumId: string): string[] {
	const dir = path.join(process.cwd(), "public", "gallery", albumId);
	if (!fs.existsSync(dir)) return [];

	const files = fs
		.readdirSync(dir)
		.filter((f) => /\.(jpe?g|png|webp|avif|gif)$/i.test(f))
		.sort();

	// 将 cover.* 排到第一位
	const coverIdx = files.findIndex((f) => /^cover\./i.test(f));
	if (coverIdx > 0) {
		const [coverFile] = files.splice(coverIdx, 1);
		files.unshift(coverFile);
	}

	const baseUrl = getNormalizedBase();
	return files.map((f) => {
		const rawPath = `/${baseUrl}/gallery/${albumId}/${f}`;
		return rawPath.replace(/\/+/g, "/"); // 无论拼了多少个杠，最后都只留一个
	});
}

/**
 * 获取相册封面图
 * 优先级：手动指定 > cover.* 文件 > 第一张图片
 */
export function getAlbumCover(album: GalleryAlbum, photos: string[]): string {
	if (album.cover) {
		// 如果手动指定的封面是以 / 开头的绝对路径，也要补上 base
		if (
			album.cover.startsWith("/") &&
			!album.cover.startsWith(import.meta.env.BASE_URL)
		) {
			const baseUrl = getNormalizedBase();
			return `${baseUrl}${album.cover}`;
		}
		return album.cover;
	}
	const coverFile = photos.find((p) => /\/cover\./i.test(p));
	return coverFile || photos[0] || "";
}
