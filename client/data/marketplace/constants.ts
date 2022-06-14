export const BASE_STALE_TIME = 1000 * 60 * 60 * 2; // 2 hours
export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_FIRST_PAGE = 0;
export const DEFAULT_CATEGORY = 'all';

export const SITE_SEARCH_CACHE_KEY = 'wpcom-site-search-wporg-plugins';
export const WPORG_PLUGINS_BLOG_ID = '108986944';
export const WCCOM_PLUGINS_BLOG_ID = '113771570';

export const WPORG_CACHE_KEY = 'wporg-plugins';

export const RETURNABLE_FIELDS = [
	'author',
	'author_login',
	'blog_name',
	'blog_icon_url',
	'blog_id',
	'category.name.default',
	'comment_count',
	'content..*.word_count',
	'date',
	'date_gmt',
	'excerpt.default',
	'excerpt_html',
	'gravatar_url',
	'has..*',
	'image.url.raw',
	'image.alt_text',
	'like_count',
	'modified',
	'modified_gmt',
	'permalink.url.raw',
	'post_id',
	'post_type',
	'shortcode_types',
	'tag.name.default',
	'title.default',
	'title_html',

	// WooCommerce product fields
	'wc.rating.count_1',
	'wc.rating.count_2',
	'wc.rating.count_3',
	'wc.rating.count_4',
	'wc.rating.count_5',
	'meta._wc_average_rating.double',
	'meta._wc_review_count.long',

	// Plugin fields
	'plugin.upgrade_notice',

	// Authors
	'plugin.contributors',

	// Versions
	'plugin.plugin_modified',
	'plugin.update_age_in_months',
	'plugin.tested',
	'plugin.requires',
	'plugin.stable_tag',
	'plugin.tagged_versions',
	'plugin.number_of_versions',
	'plugin.number_of_translations',
	'plugin.num_months_updated',
	'plugin.disabled',

	// Install Info
	'plugin.percent_on_stable',
	'plugin.active_installs',
	'plugin.contributors_active_installs',

	// Support Info
	'plugin.support_resolution_yes',
	'plugin.support_resolution_no',
	'plugin.support_resolution_mu',
	'plugin.support_resolution_percentage',
	'plugin.support_threads',
	'plugin.support_threads_resolved',
	'plugin.support_threads_percentage',
	'plugin.support_threads_percentage_p1',

	// Ratings
	'plugin.rating',
	'plugin.num_ratings',
	'plugin.rating_1',
	'plugin.rating_2',
	'plugin.rating_3',
	'plugin.rating_4',
	'plugin.rating_5',
	'plugin.boost',

	// Translated fields
	'plugin.title',
	'plugin.excerpt',
	'plugin.content',
	'plugin.all_content',
	'plugin.description',
	'plugin.installation',
	'plugin.faq',
	'plugin.changelog',
];
