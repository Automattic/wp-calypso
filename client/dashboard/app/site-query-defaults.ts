import type { FetchSitesOptions } from '@automattic/api-core';

/**
 * Apply the dashboard's default site-query options. Staging sites are excluded
 * by default ( `include_staging: false` ); callers opt back in by passing
 * `include_staging: true`. Kept dashboard-local so that other
 * `@automattic/api-queries` consumers ( e.g. Reader, me/mcp ) are unaffected.
 *
 * Generic over the caller's options so the paginated and non-paginated queries
 * each keep their own option shape.
 */
export const withDashboardSiteDefaults = < T extends Partial< FetchSitesOptions > >(
	options?: T
): T & FetchSitesOptions =>
	// Cast: the spread is the defaults merged with `options`, i.e. `T & FetchSitesOptions`,
	// but TS can't infer that a spread covers the generic `T`.
	( {
		site_visibility: 'visible',
		include_a8c_owned: false,
		include_staging: false,
		...options,
	} ) as T & FetchSitesOptions;
