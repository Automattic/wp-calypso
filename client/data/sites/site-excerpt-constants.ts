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
	'plan',
	'jetpack',
	'is_wpcom_atomic',
] as const;

export const SITE_EXCERPT_COMPUTED_FIELDS = [ 'slug' ] as const;

export const SITE_EXCERPT_REQUEST_OPTIONS = [
	'is_wpforteams_site',
	'updated_at',
	'is_redirect',
	'unmapped_url',
] as const;
