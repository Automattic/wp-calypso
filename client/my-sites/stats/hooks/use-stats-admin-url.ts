import { sitePremiumAnalyticsEnabledQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'calypso/state';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { PREMIUM_ANALYTICS_PAGE_PATH } from '../stats-notices/premium-analytics-preview-cohort';

/**
 * The wp-admin address a "see your stats" link should open: the Premium Analytics dashboard when
 * the site has it switched on, `statsPath` otherwise.
 * @param siteId    Site the link belongs to.
 * @param statsPath The classic Stats path, relative to wp-admin.
 */
export default function useStatsAdminUrl(
	siteId: number | null | undefined,
	statsPath = 'admin.php?page=stats'
): string | null {
	// Core's settings route answers only to manage_options, so anyone else keeps the Stats link.
	const canReadSetting = useSelector(
		( state ) => !! siteId && !! canCurrentUser( state, siteId, 'manage_options' )
	);
	const { data: isPremiumAnalyticsEnabled } = useQuery( {
		...sitePremiumAnalyticsEnabledQuery( siteId ?? 0 ),
		enabled: canReadSetting,
	} );

	return useSelector( ( state ) =>
		getSiteAdminUrl(
			state,
			siteId,
			isPremiumAnalyticsEnabled ? PREMIUM_ANALYTICS_PAGE_PATH : statsPath
		)
	);
}
