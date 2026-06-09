import type { FetchPaginatedSitesOptions } from '@automattic/api-core';

/**
 * Apply the dashboard's default site-query options. Staging sites are excluded
 * by default ( `include_staging: false` ); callers opt back in by passing
 * `include_staging: true`. Kept dashboard-local so that other
 * `@automattic/api-queries` consumers ( e.g. Reader, me/mcp ) are unaffected.
 */
export const withDashboardSiteDefaults = (
	options?: Partial< FetchPaginatedSitesOptions >
): FetchPaginatedSitesOptions => ( {
	site_visibility: 'visible',
	include_a8c_owned: false,
	include_staging: false,
	...options,
} );
