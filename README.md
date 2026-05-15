# 知花咏歌

> 我的个人博客，基于 [Firefly](https://github.com/CuteLeaf/Firefly) 模板继续延伸。

![Node.js >= 22](https://img.shields.io/badge/node.js-%3E%3D22-brightgreen)
![pnpm >= 9](https://img.shields.io/badge/pnpm-%3E%3D9-blue)
![Astro](https://img.shields.io/badge/Astro-6.0.8-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue)

**README**: [简体中文](README.md) | [English](README.en.md)

## 简介

这是一个用来记录日常、总结、ACGN 内容和折腾笔记的静态博客。项目沿用了 Firefly 的 Astro 架构、布局系统和视觉基础，并在此之上调整为更适合我自己的站点：文章、番组、相册，以及一个用于展示游戏库和游玩时间的 Steam 统计页。

当前站点地址：

```text
https://www.eurekaimer.icu/blog
```

## 功能

- Astro 静态站点，GitHub Pages 自动部署
- 文章归档、分类、标签、RSS 和 Pagefind 搜索
- Bangumi 收藏页，用于展示动画、书籍、游戏等条目
- 相册页面，用于整理图片记录
- Steam 统计页，展示游戏库、最近游玩、常玩游戏和游玩时间趋势
- Steam API key 通过 `.env.local` 和 GitHub Secrets 管理，不写入仓库
- GitHub Actions 每天自动更新 Steam 历史快照，用于生成 7 天 / 30 天趋势图和小结文案

## 本地开发

环境要求：

- Node.js >= 22
- pnpm >= 9

安装依赖：

```bash
pnpm install
```

本地开发：

```bash
pnpm dev
```

构建与预览：

```bash
pnpm build
pnpm preview
```

如果本地访问 Steam API 需要代理，可以在构建时让 Node 读取环境代理：

```bash
NODE_USE_ENV_PROXY=1 pnpm build
```

## Steam 配置

Steam 页需要两个配置：

- `src/config/siteConfig.ts` 中的 `steam.steamId`
- 环境变量 `STEAM_API_KEY`

本地开发时，在 `.env.local` 中填写：

```env
STEAM_API_KEY=""
```

`.env.local` 已被 `.gitignore` 忽略。仓库中只保留 `.env.example` 作为示例。

GitHub Actions 中需要配置同名 Secret：

```text
Settings -> Secrets and variables -> Actions -> New repository secret
Name: STEAM_API_KEY
```

相关命令：

```bash
pnpm steam:history
```

这个命令会更新 `src/data/steam-history.json`，文件只保存统计数字，不保存 API key。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 更新图标、更新 Steam 历史并构建站点 |
| `pnpm preview` | 预览 `dist` 构建结果 |
| `pnpm check` | 运行 Astro 检查 |
| `pnpm format` | 格式化 `src` 目录 |
| `pnpm new-post <filename>` | 创建新文章 |
| `pnpm steam:history` | 手动更新 Steam 历史快照 |

## 部署

项目使用 GitHub Actions 部署到 GitHub Pages：

- `.github/workflows/deploy.yml`：推送到 `master` 后构建并部署
- `.github/workflows/steam-history.yml`：每天定时更新 Steam 历史快照并提交

部署前需要确认仓库的 Actions Secret 中已经配置 `STEAM_API_KEY`。

## 致谢

本项目基于 [Firefly](https://github.com/CuteLeaf/Firefly) 继续定制，Firefly 基于 [fuwari](https://github.com/saicaca/fuwari) 二次开发。感谢原作者提供的主题基础、布局设计和组件思路。

## 许可

本项目遵循 [MIT License](./LICENSE)。
