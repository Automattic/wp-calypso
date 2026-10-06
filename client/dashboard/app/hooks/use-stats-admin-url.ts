import { sitePremiumAnalyticsEnabledQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { getPremiumAnalyticsPath } from '../../utils/premium-analytics-url';

const STATS_PATH = 'admin.php?page=stats';

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
 * site has it switched on, `statsPath` otherwise. Undefined until the site answers, so an early
 * click cannot land on the page the answer is about to replace.
 * @todo UNI-832: return the dashboard unconditionally once Premium Analytics replaces Stats.
 * @param site      The site the link belongs to.
 * @param statsPath The classic Stats path, relative to wp-admin.
 */
export function useStatsAdminUrl(
	site: StatsAdminUrlSite | null | undefined,
	statsPath = STATS_PATH
): string | undefined {
	// Core's settings route answers only to manage_options, so anyone else keeps the Stats link.
	const { data: isPremiumAnalyticsEnabled, isLoading } = useQuery( {
		...sitePremiumAnalyticsEnabledQuery( site?.ID ?? 0 ),
		enabled: !! site?.ID && !! site.capabilities?.manage_options,
	} );

	const adminUrl = site?.options?.admin_url;
	if ( ! adminUrl || isLoading ) {
		return undefined;
	}

	const path = isPremiumAnalyticsEnabled ? getPremiumAnalyticsPath() : statsPath;
	return `${ adminUrl.replace( /\/?$/, '/' ) }${ path }`;
}
