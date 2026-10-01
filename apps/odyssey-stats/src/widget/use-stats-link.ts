import {
	getPremiumAnalyticsPath,
	type PremiumAnalyticsRange,
} from 'calypso/dashboard/utils/premium-analytics-url';
import usePremiumAnalyticsStatusQuery from 'calypso/my-sites/stats/hooks/use-premium-analytics-status-query';
import { optionalConfig } from '../lib/config-api';
import canCurrentUser from '../lib/selectors/can-current-user';
import getSiteAdminUrl from '../lib/selectors/get-site-admin-url';

/**
 * Picks where a widget link goes: the Premium Analytics route when the site has the dashboard
 * switched on, the classic Stats URL otherwise, including on a Jetpack too old to report it.
 * @param siteId The site the widget shows.
 * @returns A function from the classic URL, the matching dashboard route (null for a link the
 * dashboard has no page for) and the days the classic link shows, to the URL to link to.
 */
export default function useStatsLink( siteId: number ) {
	// Core's settings route answers only to manage_options, so anyone else keeps the Stats links.
	const { data: isPremiumAnalyticsEnabled } = usePremiumAnalyticsStatusQuery(
		siteId,
		!! canCurrentUser( siteId, 'manage_options' )
	);
	const adminUrl = getSiteAdminUrl( siteId );
	// Absent before Jetpack sent it, and empty for a site set to a fixed UTC offset.
	const timezone = optionalConfig( 'timezone' );

	return ( statsUrl: string, route: string | null, range?: PremiumAnalyticsRange ): string =>
		isPremiumAnalyticsEnabled && adminUrl && route !== null
			? `${ adminUrl }${ getPremiumAnalyticsPath(
					route,
					range && { ...range, timezone: typeof timezone === 'string' ? timezone : undefined }
				) }`
			: statsUrl;
}
