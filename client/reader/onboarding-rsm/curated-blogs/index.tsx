import { creativeArtsBlogs } from './creative-arts';
import { industryBlogs } from './industry';
import { lifestyleBlogs } from './lifestyle';
import { popularBlogs } from './popular';
import { societyBlogs } from './society';
import { technologyBlogs } from './technology';

export const curatedBlogs = {
	...lifestyleBlogs,
	...technologyBlogs,
	...creativeArtsBlogs,
	...societyBlogs,
	...industryBlogs,
	...popularBlogs,
};

export type CuratedBlog = {
	feed_ID: number;
	site_ID: number;
	site_URL: string;
	site_name: string;
	feed_URL: string;
	has_icon: boolean;
};

export type CuratedBlogsList = Record< string, CuratedBlog[] >;
