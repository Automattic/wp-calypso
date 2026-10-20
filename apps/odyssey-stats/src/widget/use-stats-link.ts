import {
	getPremiumAnalyticsPath,
	type PremiumAnalyticsRange,
} from 'calypso/dashboard/utils/premium-analytics-url';
import usePremiumAnalyticsStatusQuery from 'calypso/my-sites/stats/hooks/use-premium-analytics-status-query';
import { optionalConfig } from '../lib/config-api';
import canCurrentUser from '../lib/selectors/can-current-user';
import getSiteAdminUrl from '../lib/selectors/get-site-admin-url';

type AnalyticsScriptData = { enabled?: unknown; can_view?: unknown };

/**
 * Whether this user's Stats links open the dashboard, as Jetpack's own links decide it: from the
 * `analytics` key Premium Analytics adds to `JetpackScriptData` on every wp-admin page.
 * @returns `undefined` unless the script data reports the dashboard enabled, so the caller can fall back to asking the site.
 */
function readScriptDataStatus(): boolean | undefined {
	const analytics = (
		window as unknown as { JetpackScriptData?: { analytics?: AnalyticsScriptData } }
	 ).JetpackScriptData?.analytics;

	return analytics?.enabled === true ? analytics.can_view === true : undefined;
}

/**
 * Picks where a widget link goes: the Premium Analytics route when the dashboard is on for this user
 * (per Jetpack's script data, else the site setting), the classic Stats URL otherwise.
 * @param siteId The site the widget shows.
 * @returns A function from the classic URL, the matching dashboard route (null for a link the
 * dashboard has no page for) and the days the classic link shows, to the URL to link to.
 */
export default function useStatsLink( siteId: number ) {
	const scriptDataStatus = readScriptDataStatus();
	// Core's settings route answers only to manage_options, so without the script data anyone else keeps the Stats links.
	const { data: queriedStatus } = usePremiumAnalyticsStatusQuery(
		siteId,
		scriptDataStatus === undefined && !! canCurrentUser( siteId, 'manage_options' )
	);
	const isPremiumAnalyticsEnabled = scriptDataStatus ?? queriedStatus;
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
