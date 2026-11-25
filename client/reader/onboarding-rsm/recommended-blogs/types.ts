import type { RecommendedBlogListKey } from './index';

export type RecommendedBlog = {
	feed_ID: number;
	site_ID: number;
	name: string;
	site_URL: string;
	feed_URL: string;
	icon_URL: string;
	description: string;
};

export type RecommendedBlogGroup = {
	key: RecommendedBlogListKey;
	title: string;
	blogs: RecommendedBlog[];
};
