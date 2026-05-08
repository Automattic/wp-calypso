import { creativeArtsBlogs } from './creative-arts';
import { industryBlogs } from './industry';
import { lifestyleBlogs } from './lifestyle';
import { societyBlogs } from './society';
import { technologyBlogs } from './technology';

export const curatedBlogs = {
	...lifestyleBlogs,
	...technologyBlogs,
	...creativeArtsBlogs,
	...societyBlogs,
	...industryBlogs,
};

export type CuratedBlog = {
	feed_ID: number;
	site_ID: number;
	site_URL: string;
	site_name: string;
	// Optional during the curated-review backfill. Tightened to required for
	// `feedUrl` and `hasIcon` once every entry has been reviewed and pasted
	// back via the curated-review tool. `isBroken` stays sparse — only emitted
	// when `true`.
	feedUrl?: string;
	hasIcon?: boolean;
	isBroken?: boolean;
};

export type CuratedBlogsList = Record< string, CuratedBlog[] >;
