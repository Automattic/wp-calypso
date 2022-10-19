// Performance-optimized request for lists of sites.
// Don't add more fields because you will make the request slower.
export const SITE_EXCERPT_REQUEST_FIELDS = [
	'ID',
	'URL',
	'is_coming_soon',
	'is_private',
	'visible',
	'launch_status',
	'icon',
	'name',
	'options',
	'p2_thumbnail_elements',
	'plan',
	'jetpack',
	'is_wpcom_atomic',
	'user_interactions',
	'lang',
] as const;

export const SITE_EXCERPT_COMPUTED_FIELDS = [ 'slug' ] as const;

export const SITE_EXCERPT_REQUEST_OPTIONS = [
	'admin_url',
	'is_redirect',
	'is_wpforteams_site',
	'launchpad_screen',
	'site_intent',
	'unmapped_url',
	'updated_at',
] as const;
