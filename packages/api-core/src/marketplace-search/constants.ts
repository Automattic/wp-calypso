// Maps sort values to values expected by the API
export const SORT_QUERY_MAP = new Map( [
	[ 'oldest', 'date_asc' ],
	[ 'newest', 'date_desc' ],
	[ 'relevance', 'score_default' ],
] );

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

	// Marketplace product fields
	'plugin.store_product_monthly_id',
	'plugin.store_product_yearly_id',

	// Marketplace premium slug
	'plugin.premium_slug',

	// Marketplace plugin slug for Calypso url
	'plugin.product_slug',

	// Marketplace software slug
	'plugin.software_slug',
	'plugin.org_slug',
] as const;
