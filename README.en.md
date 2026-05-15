# Eurekaimer Blog

> My personal blog, extended from the [Firefly](https://github.com/CuteLeaf/Firefly) template.

![Node.js >= 22](https://img.shields.io/badge/node.js-%3E%3D22-brightgreen)
![pnpm >= 9](https://img.shields.io/badge/pnpm-%3E%3D9-blue)
![Astro](https://img.shields.io/badge/Astro-6.0.8-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue)

**README**: [简体中文](README.md) | [English](README.en.md)

## Overview

This is a static personal blog for daily notes, summaries, ACGN writing, and small technical experiments. It keeps Firefly's Astro-based structure, layout system, and visual foundation, then adapts them for my own site: posts, Bangumi collections, galleries, and a Steam stats page for game library and playtime records.

Live site:

```text
https://www.eurekaimer.icu/blog
```

## Features

- Astro static site deployed with GitHub Pages
- Post archive, categories, tags, RSS, and Pagefind search
- Bangumi collection page for anime, books, games, and related entries
- Gallery page for photo records
- Steam stats page with library overview, recent games, top games, and playtime trends
- Steam API key managed through `.env.local` and GitHub Secrets, never committed to the repo
- Daily GitHub Actions snapshots for Steam history, powering 7-day / 30-day trend charts and short summary text

## Local Development

Requirements:

- Node.js >= 22
- pnpm >= 9

Install dependencies:

```bash
pnpm install
```

Start the dev server:

```bash
pnpm dev
```

Build and preview:

```bash
pnpm build
pnpm preview
```

If your local network needs a proxy for the Steam API, let Node read proxy environment variables during build:

```bash
NODE_USE_ENV_PROXY=1 pnpm build
```

## Steam Setup

The Steam page needs two values:

- `steam.steamId` in `src/config/siteConfig.ts`
- `STEAM_API_KEY` as an environment variable

For local development, put the key in `.env.local`:

```env
STEAM_API_KEY=""
```

`.env.local` is ignored by git. The repo only keeps `.env.example` as a safe template.

For GitHub Actions, add a repository secret with the same name:

```text
Settings -> Secrets and variables -> Actions -> New repository secret
Name: STEAM_API_KEY
```

Related command:

```bash
pnpm steam:history
```

This updates `src/data/steam-history.json`. The file only stores statistics, not the API key.

## Commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Generate icons, update Steam history, and build the site |
| `pnpm preview` | Preview the built `dist` output |
| `pnpm check` | Run Astro checks |
| `pnpm format` | Format the `src` directory |
| `pnpm new-post <filename>` | Create a new post |
| `pnpm steam:history` | Manually update the Steam history snapshot |

## Deployment

The site is deployed to GitHub Pages through GitHub Actions:

- `.github/workflows/deploy.yml`: builds and deploys on pushes to `master`
- `.github/workflows/steam-history.yml`: updates the Steam history snapshot every day and commits it back

Make sure the repository has the `STEAM_API_KEY` Actions secret before deployment.

## Credits

This project is customized from [Firefly](https://github.com/CuteLeaf/Firefly), which is based on [fuwari](https://github.com/saicaca/fuwari). Thanks to the original authors for the theme foundation, layout design, and component ideas.

## License

This project is licensed under the [MIT License](./LICENSE).
