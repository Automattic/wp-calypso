import type { Design } from './types';

export const DEFAULT_GLOBAL_STYLES_VARIATION_SLUG = 'default';
export const SHOW_ALL_SLUG = 'CLIENT_ONLY_SHOW_ALL_SLUG';

/**
 * mShot options
 */
export const DEFAULT_VIEWPORT_WIDTH = 1600;
export const DEFAULT_VIEWPORT_HEIGHT = 1040;
export const MOBILE_VIEWPORT_WIDTH = 599;

/**
 * Generated design picker
 */
export const STICKY_OFFSET_TOP = 109;

/**
 * Hard-coded design
 */
export const ASSEMBLER_V2_DESIGN = {
	slug: 'assembler',
	title: 'Assembler',
	recipe: {
		stylesheet: 'pub/assembler',
	},
	design_type: 'assembler',
} as Design;

export const FREE_THEME = 'free';
export const PERSONAL_THEME = 'personal';
export const PREMIUM_THEME = 'premium';
export const DOT_ORG_THEME = 'dot-org';
export const BUNDLED_THEME = 'bundled';
export const MARKETPLACE_THEME = 'marketplace';

/**
 * Categories
 */
export const FEATURE_CATEGORIES = {
	BLOG: 'blog',
	NEWSLETTER: 'newsletter',
	PORTFOLIO: 'portfolio',
	STORE: 'store',
};

export const DESIGN_TIER_CATEGORIES = {
	FREE: FREE_THEME,
};

export const SUBJECT_CATEGORIES = {
	BUSINESS: 'business',
	COMMUNITY_NON_PROFIT: 'community-non-profit',
	AUTHORS_WRITERS: 'authors-writers',
	EDUCATION: 'education',
	ENTERTAINMENT: 'entertainment',
	EVENTS: 'events',
};

export const CATEGORIES = {
	...FEATURE_CATEGORIES,
	...SUBJECT_CATEGORIES,
};
