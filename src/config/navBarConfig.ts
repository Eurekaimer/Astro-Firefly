import {
	LinkPreset,
	type NavBarConfig,
	type NavBarLink,
	type NavBarSearchConfig,
	NavBarSearchMethod,
} from "../types/config";
import { siteConfig } from "./siteConfig";

// 根据页面开关动态生成导航栏配置
const getDynamicNavBarConfig = (): NavBarConfig => {
    // 基础导航栏链接
    const links: (NavBarLink | LinkPreset)[] = [
        // 主页
        LinkPreset.Home,

        // 归档
        LinkPreset.Archive,
    ];

	if (siteConfig.pages.moments) {
		links.push(LinkPreset.Moments);
	}

    // 根据配置决定是否添加友链，在siteConfig关闭pages.friends时导航栏不显示友链
    if (siteConfig.pages.friends) {
        links.push(LinkPreset.Friends);
    }

    // 根据配置决定是否添加留言板，在siteConfig关闭pages.guestbook时导航栏不显示留言板
    if (siteConfig.pages.guestbook) {
        links.push(LinkPreset.Guestbook);
    }

    // 【新增】根据配置决定是否添加相册（与番组计划平行）
    if (siteConfig.pages.gallery) {
        links.push(LinkPreset.Gallery);
    }

    // 根据配置决定是否添加番组计划
    if (siteConfig.pages.bangumi) {
        links.push(LinkPreset.Bangumi);
    }

    // 根据配置决定是否添加 Steam 统计
    if (siteConfig.pages.steam) {
        links.push(LinkPreset.Steam);
    }

    // 根据配置决定是否添加关于页面
    if (siteConfig.pages.about !== false) {
        links.push(LinkPreset.About);
    }

    // 仅返回链接，其它导航搜索相关配置在模块顶层常量中独立导出
    return { links } as NavBarConfig;
};

// 导航搜索配置
export const navBarSearchConfig: NavBarSearchConfig = {
	method: NavBarSearchMethod.PageFind,
};

export const navBarConfig: NavBarConfig = getDynamicNavBarConfig();
