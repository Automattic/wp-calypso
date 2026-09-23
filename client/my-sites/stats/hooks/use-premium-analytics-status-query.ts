import { isEnabled } from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import getDefaultQueryParams from './default-query-params';

/**
 * The site setting the dashboard's opt-in is registered under, exposed through core's settings
 * route. Absent from the response on a Jetpack too old to register it.
 */
export const PREMIUM_ANALYTICS_ENABLED_SETTING = 'jetpack_premium_analytics_enabled';

type SiteSettings = {
	[ PREMIUM_ANALYTICS_ENABLED_SETTING ]?: boolean;
};

export const premiumAnalyticsStatusQueryKey = ( siteId: number | null ) => [
	'stats',
	'premium-analytics-status',
	siteId,
];

/**
 * Address core's settings route for whichever build we are running in.
 *
 * Odyssey talks to the site directly and unprefixed. That needs `isLocalApiCall`, because the
 * Jetpack XHR wrapper otherwise rewrites any namespace it doesn't recognise to
 * `jetpack/v4/stats-app` and the request 404s. Calypso goes through the WordPress.com proxy and
 * needs the site in the path instead.
 * @param siteId Site to address.
 */
export const premiumAnalyticsStatusRequest = ( siteId: number | null ) =>
	isEnabled( 'is_running_in_jetpack_site' )
		? { apiNamespace: 'wp/v2', path: '/settings', isLocalApiCall: true }
		: { apiNamespace: 'wp/v2', path: `/sites/${ siteId }/settings` };

/**
 * Whether the new analytics dashboard is switched on for this site.
 *
 * Three answers, not two: `true` and `false` come from the site, and `undefined` means it never
 * offered the setting at all — a Jetpack too old to register it — which is not the same as off.
 *
 * The site answers this itself: the opt-in is a local option there, and a sticker we set can
 * enable the dashboard without ever touching it.
 * @param siteId Site to query.
 * @param enabled Whether to run the query at all.
 */
export default function usePremiumAnalyticsStatusQuery( siteId: number | null, enabled = true ) {
	return useQuery< SiteSettings, unknown, boolean | undefined >( {
		...getDefaultQueryParams(),
		queryKey: premiumAnalyticsStatusQueryKey( siteId ),
		queryFn: () => wpcom.req.get( premiumAnalyticsStatusRequest( siteId ) ),
		select: ( data ) => data?.[ PREMIUM_ANALYTICS_ENABLED_SETTING ],
		enabled: !! siteId && enabled,
		retry: false,
	} );
}
