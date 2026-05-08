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
	// Optional during the curated-review backfill. Tightened to required once
	// every entry has been reviewed and pasted back via the curated-review
	// tool. (Entries the operator marks as broken are simply omitted from the
	// regenerated source, so there's no `isBroken` field to track here.)
	feedUrl?: string;
	hasIcon?: boolean;
};

export type CuratedBlogsList = Record< string, CuratedBlog[] >;
