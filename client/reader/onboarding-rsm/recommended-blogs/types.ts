export const RECOMMENDED_BLOG_LIST_KEYS = [
	'most-subscribed',
	'food',
	'drinks',
	'dining',
	'travel',
	'world-travel',
	'photography',
	'art',
	'technology',
	'software',
	'nature',
	'science',
	'space',
	'design',
	'diy',
	'music',
	'movies',
	'culture',
	'books',
	'family',
	'writing',
	'politics',
	'blogging',
	'fashion',
	'health',
	'humor',
	'poetry',
	'love',
	'entertainment',
	'education',
	'inspiration',
	'relationships',
	'religion',
	'sports',
	'business',
	'creativity',
	'beauty',
	'work',
	'history',
	'reading',
	'social-media',
	'cooking',
	'internet',
	'lifestyle',
	'media',
	'fitness',
	'environment',
] as const;

export type RecommendedBlogListKey = ( typeof RECOMMENDED_BLOG_LIST_KEYS )[ number ];

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
