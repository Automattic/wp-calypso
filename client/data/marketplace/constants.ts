export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_CATEGORY = 'all';

export const SITE_SEARCH_CACHE_KEY = 'wpcom-site-search-wporg-plugins';
export const WPORG_PLUGINS_BLOG_ID = '108986944';
export const WCCOM_PLUGINS_BLOG_ID = '113771570';

export const WPORG_CACHE_KEY = 'wporg-plugins';

// TODO: Only include the required fields here
export const RETURNABLE_FIELDS = [
	'blog_icon_url',
	'comment_count',
	'plugin.excerpt',
	'like_count',
	'modified',
	'modified_gmt',
	'plugin.title',
	'author',
	'plugin.author',
	'author_login',
	'blog_id',
	'date',
	'date_gmt',
	'permalink.url.raw',
	'post_id',
	'post_type',
	'slug',

	// Versions
	'plugin.tested',
	'plugin.stable_tag',

	// Install Info
	'plugin.active_installs',

	// Support Info
	'plugin.support_threads',
	'plugin.support_threads_resolved',

	// Ratings
	'plugin.rating',
	'plugin.num_ratings',

	// Images
	'plugin.icons',
] as const;
