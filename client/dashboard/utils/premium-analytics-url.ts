/**
 * The wp-admin page the Premium Analytics ("Stats v2") dashboard is served from.
 */
const PREMIUM_ANALYTICS_PAGE = 'jetpack-premium-analytics-wp-admin';

/**
 * A Premium Analytics dashboard route as a path relative to wp-admin. The dashboard's router keeps
 * its whole path in the `p` param, as Jetpack's own `getAnalyticsUrl()` builds it.
 *
 * Kept free of imports so the Odyssey bundle can use it without pulling in the dashboard's data layer.
 * @param route The dashboard route, e.g. `/`, `/post/123` or `/reports/posts`.
 */
export function getPremiumAnalyticsPath( route = '/' ): string {
	return `admin.php?${ new URLSearchParams( { page: PREMIUM_ANALYTICS_PAGE, p: route } ) }`;
}
