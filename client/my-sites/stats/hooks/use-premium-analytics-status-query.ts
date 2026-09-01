import config from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import getDefaultQueryParams from './default-query-params';

type PremiumAnalyticsStatus = {
	enabled: boolean;
};

export const premiumAnalyticsStatusQueryKey = ( siteId: number | null ) => [
	'stats',
	'premium-analytics-status',
	siteId,
];

/**
 * Address the status route for whichever build we are running in.
 *
 * The route is registered on the site itself, so Odyssey talks to it directly and unprefixed. That
 * needs `isLocalApiCall`, because the Jetpack XHR wrapper otherwise rewrites any namespace it
 * doesn't recognise to `jetpack/v4/stats-app` and the request 404s. Calypso goes through the
 * WordPress.com proxy and needs the site in the path instead.
 * @param siteId Site to address.
 */
export const premiumAnalyticsStatusRequest = ( siteId: number | null ) =>
	config.isEnabled( 'is_running_in_jetpack_site' )
		? { apiNamespace: 'wpcom/v2', path: '/premium-analytics/status', isLocalApiCall: true }
		: { apiNamespace: 'wpcom/v2', path: `/sites/${ siteId }/premium-analytics/status` };

/**
 * Whether the new analytics dashboard is switched on for this site.
 *
 * The site answers this itself: enablement is a local option there, and a site can also be switched
 * on by the rollout sticker, which never touches that option.
 * @param siteId Site to query.
 * @param enabled Whether to run the query at all.
 */
export default function usePremiumAnalyticsStatusQuery( siteId: number | null, enabled = true ) {
	return useQuery< PremiumAnalyticsStatus, unknown, boolean >( {
		...getDefaultQueryParams(),
		queryKey: premiumAnalyticsStatusQueryKey( siteId ),
		queryFn: () => wpcom.req.get( premiumAnalyticsStatusRequest( siteId ) ),
		select: ( data ) => !! data?.enabled,
		enabled: !! siteId && enabled,
		retry: false,
	} );
}
