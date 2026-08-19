import type { FriendLink, FriendsPageConfig } from "../types/config";

// 可以在src/content/spec/friends.md中编写友链页面下方的自定义内容

// 友链页面配置
export const friendsPageConfig: FriendsPageConfig = {
	// 页面标题，如果留空则使用 i18n 中的翻译
	title: "",

	// 页面描述文本，如果留空则使用 i18n 中的翻译
	description: "",

	// 是否显示底部自定义内容（friends.mdx 中的内容）
	showCustomContent: true,

	// 是否显示评论区，需要先在commentConfig.ts启用评论系统
	showComment: true,

	// 是否开启随机排序配置，如果开启，就会忽略权重，构建时进行一次随机排序
	randomizeSort: false,
};

// 友链配置
export const friendsConfig: FriendLink[] = [
	{
		title: "笔记站",
		imgurl: "https://avatars.githubusercontent.com/u/88918522?v=40",
		desc: "「そばにいて」",
		siteurl: "https://www.eurekaimer.icu/Stathelper/",
		tags: ["Blog"],
		weight: 10, // 权重，数字越大排序越靠前
		enabled: true, // 是否启用
	},
	{
		title: "Meraki's bar",
		imgurl: "https://avatars.githubusercontent.com/u/187371253?v=4",
		desc: "一位学弟的博客",
		siteurl: "https://meraki111.netlify.app/",
		tags: ["Blog"],
		weight: 5,
		enabled: true,
	},
	{
		title: "Ice Year の位面",
		imgurl: "https://avatars.githubusercontent.com/iceyear",
		desc: "Il n'y a pas de hasard, il n'y a que des rendez-vous.",
		siteurl: "https://blog.iceyear.eu.org",
		tags: ["Blog"],
		weight: 5,
		enabled: true,
	},
	{
		title: "春风少年兄",
		imgurl: "https://avatars.githubusercontent.com/u/138082074?v=4",
		desc: "你在世纪大道东门",
		siteurl: "https://blog.0pt.icu/",
		tags: ["Blog"],
		weight: 5,
		enabled: true,
	},
	{
		title: "Yon Zilch",
		imgurl: "https://avatars.githubusercontent.com/u/141223334?v=4",
		desc: "From the yon, into zilch. Life, a vanished dream.",
		siteurl: "https://blog.yon.im/",
		tags: ["Blog"],
		weight: 5,
		enabled: true,
	},
	{
		title: "Wcowin",
		imgurl: "https://pic4.zhimg.com/80/v2-a0456a5f527c1923f096759f2926012f_1440w.webp",
		desc: "循此苦旅，以达星辰",
		siteurl: "https://wcowin.work/",
		tags: ["Blog"],
		weight: 5,
		enabled: true,
	},
	{
		title: "Wuslee",
		imgurl: "https://avatars.githubusercontent.com/u/201520333?v=4",
		desc: "DB",
		siteurl: "https://wuslee-yz.top/",
		tags: ["Blog"],
		weight: 5,
		enabled: true,
	},
];

// 获取启用的友链并进行排序
export const getEnabledFriends = (): FriendLink[] => {
	const friends = friendsConfig.filter((friend) => friend.enabled);

	if (friendsPageConfig.randomizeSort) {
		return friends.sort(() => Math.random() - 0.5);
	}

	return friends.sort((a, b) => b.weight - a.weight);
};
