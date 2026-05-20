import { creativeArtsBlogs } from './creative-arts';
import { industryBlogs } from './industry';
import { lifestyleBlogs } from './lifestyle';
import { societyBlogs } from './society';
import { technologyBlogs } from './technology';
import type { CuratedBlogsList } from './index';

export interface CuratedFile {
	/** Filename under `curated-blogs/`, sans extension. */
	slug: string;
	/** Variable name exported by that file. */
	variableName: string;
	tagMap: CuratedBlogsList;
}

/**
 * The set of curated-blogs files reviewable by the dev tools (curated-review,
 * curated-discover). `popular.tsx` is intentionally excluded — it's a tagless
 * direct-key list rendered by the "Most Subscribed" pack and not part of the
 * tag-keyed review/discover workflow.
 */
export const CURATED_FILES: CuratedFile[] = [
	{ slug: 'creative-arts', variableName: 'creativeArtsBlogs', tagMap: creativeArtsBlogs },
	{ slug: 'industry', variableName: 'industryBlogs', tagMap: industryBlogs },
	{ slug: 'lifestyle', variableName: 'lifestyleBlogs', tagMap: lifestyleBlogs },
	{ slug: 'society', variableName: 'societyBlogs', tagMap: societyBlogs },
	{ slug: 'technology', variableName: 'technologyBlogs', tagMap: technologyBlogs },
];
