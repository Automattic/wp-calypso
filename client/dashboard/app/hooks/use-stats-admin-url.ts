import { sitePremiumAnalyticsEnabledQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';

const STATS_PATH = 'admin.php?page=stats';
const PREMIUM_ANALYTICS_PATH = 'admin.php?page=jetpack-premium-analytics-wp-admin';

/**
 * The fields this hook reads, which both the dashboard's `Site` and classic Calypso's
 * `SiteDetails` carry.
 */
export interface StatsAdminUrlSite {
	ID: number;
	options?: { admin_url?: string };
	capabilities?: { manage_options?: boolean };
}

/**
 * The wp-admin address a "see your stats" link opens: the Premium Analytics dashboard when the
 * site has it switched on, `statsPath` otherwise. The one place that knows both addresses.
 * @todo UNI-832: return the dashboard unconditionally once Premium Analytics replaces Stats.
 * @param site      The site the link belongs to.
 * @param statsPath The classic Stats path, relative to wp-admin.
 */
export function useStatsAdminUrl(
	site: StatsAdminUrlSite | null | undefined,
	statsPath = STATS_PATH
): string | undefined {
	// Core's settings route answers only to manage_options, so anyone else keeps the Stats link.
	const { data: isPremiumAnalyticsEnabled } = useQuery( {
		...sitePremiumAnalyticsEnabledQuery( site?.ID ?? 0 ),
		enabled: !! site?.ID && !! site.capabilities?.manage_options,
	} );

	const adminUrl = site?.options?.admin_url;
	if ( ! adminUrl ) {
		return undefined;
	}

	const path = isPremiumAnalyticsEnabled ? PREMIUM_ANALYTICS_PATH : statsPath;
	return `${ adminUrl.replace( /\/?$/, '/' ) }${ path }`;
}
