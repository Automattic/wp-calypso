// Performance-optimized request for lists of sites.
// Don't add more fields because you will make the request slower.
export const SITE_EXCERPT_REQUEST_FIELDS = [
	'ID',
	'URL',
	'is_coming_soon',
	'is_private',
	'is_deleted',
	'is_vip',
	'visible',
	'launch_status',
	'icon',
	'name',
	'options',
	'p2_thumbnail_elements',
	'plan',
	'jetpack',
	'jetpack_connection',
	'is_wpcom_atomic',
	'is_wpcom_staging_site',
	'user_interactions',
	'lang',
	'site_owner',
] as const;

export const SITE_EXCERPT_COMPUTED_FIELDS = [ 'slug' ] as const;

export const SITE_EXCERPT_REQUEST_OPTIONS = [
	'admin_url',
	'is_domain_only',
	'is_redirect',
	'is_wpforteams_site',
	'launchpad_screen',
	'site_intent',
	'unmapped_url',
	'updated_at',
	'wpcom_production_blog_id',
	'wpcom_staging_blog_ids',
	'wpcom_admin_interface',
] as const;
