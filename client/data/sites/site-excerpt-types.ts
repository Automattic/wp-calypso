import type { SiteData, SiteDataOptions } from 'calypso/state/ui/selectors/site-data';

// Performance-optimized request for lists of sites.
// Don't add more fields because you will make the request slower.
export const SITE_EXCERPT_REQUEST_FIELDS = [
	'ID',
	'URL',
	'is_coming_soon',
	'is_private',
	'launch_status',
	'icon',
	'name',
	'options',
	'plan',
] as const;

export const SITE_EXCERPT_COMPUTED_FIELDS = [ 'slug' ] as const;

export const SITE_EXCERPT_REQUEST_OPTIONS = [ 'is_wpforteams_site', 'updated_at' ] as const;

export type SiteExcerptNetworkData = Pick<
	SiteData,
	typeof SITE_EXCERPT_REQUEST_FIELDS[ number ]
> & {
	options?: Pick< SiteDataOptions, typeof SITE_EXCERPT_REQUEST_OPTIONS[ number ] >;
};

export type SiteExcerptData = Pick<
	SiteData,
	typeof SITE_EXCERPT_REQUEST_FIELDS[ number ] | typeof SITE_EXCERPT_COMPUTED_FIELDS[ number ]
> & {
	options?: Pick< SiteDataOptions, typeof SITE_EXCERPT_REQUEST_OPTIONS[ number ] >;
};
