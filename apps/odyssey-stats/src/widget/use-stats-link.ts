import { getPremiumAnalyticsPath } from 'calypso/dashboard/utils/premium-analytics-url';
import usePremiumAnalyticsStatusQuery from 'calypso/my-sites/stats/hooks/use-premium-analytics-status-query';
import canCurrentUser from '../lib/selectors/can-current-user';
import getSiteAdminUrl from '../lib/selectors/get-site-admin-url';

/**
 * Picks where a widget link goes: the Premium Analytics route when the site has the dashboard
 * switched on, the classic Stats URL otherwise, including on a Jetpack too old to report it.
 * @param siteId The site the widget shows.
 * @returns A function from the classic URL and the matching dashboard route, or null for a link
 * the dashboard has no page for, to the URL to link to.
 */
export default function useStatsLink( siteId: number ) {
	// Core's settings route answers only to manage_options, so anyone else keeps the Stats links.
	const { data: isPremiumAnalyticsEnabled } = usePremiumAnalyticsStatusQuery(
		siteId,
		!! canCurrentUser( siteId, 'manage_options' )
	);
	const adminUrl = getSiteAdminUrl( siteId );

	return ( statsUrl: string, route: string | null ): string =>
		isPremiumAnalyticsEnabled && adminUrl && route !== null
			? `${ adminUrl }${ getPremiumAnalyticsPath( route ) }`
			: statsUrl;
}
