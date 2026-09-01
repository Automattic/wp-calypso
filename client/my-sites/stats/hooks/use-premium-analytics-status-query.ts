import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import getDefaultQueryParams from './default-query-params';

type PremiumAnalyticsStatus = {
	enabled: boolean;
};

/**
 * Whether the new analytics dashboard is switched on for this site.
 *
 * The site answers this itself: enablement is a local option there, and a site can also be switched
 * on by the rollout sticker, which never touches that option. Treat a failure as "not enabled" —
 * the route only exists on sites running a Jetpack new enough to serve it, and the caller is asking
 * so it can invite someone to turn the dashboard on.
 * @param siteId Site to query.
 * @param enabled Whether to run the query at all.
 */
export default function usePremiumAnalyticsStatusQuery( siteId: number | null, enabled = true ) {
	return useQuery< PremiumAnalyticsStatus, unknown, boolean >( {
		...getDefaultQueryParams(),
		queryKey: [ 'stats', 'premium-analytics-status', siteId ],
		queryFn: () =>
			wpcom.req.get( {
				apiNamespace: 'wpcom/v2',
				path: `/sites/${ siteId }/premium-analytics/status`,
			} ),
		select: ( data ) => !! data?.enabled,
		enabled: !! siteId && enabled,
		retry: false,
	} );
}
