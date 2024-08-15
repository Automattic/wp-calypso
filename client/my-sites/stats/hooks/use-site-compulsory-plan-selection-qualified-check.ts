import { useSelector } from 'calypso/state';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import { getSiteOption } from 'calypso/state/sites/selectors';
import usePlanUsageQuery from './use-plan-usage-query';

// Targeting new sites
export const isSiteNew = ( state: object, siteId: number | null ) => {
	const siteCreatedTimeStamp = getSiteOption( state, siteId, 'created_at' ) as string;

	return siteCreatedTimeStamp && new Date( siteCreatedTimeStamp ) > new Date( '2024-01-31' );
};

export default function useSiteCompulsoryPlanSelectionQualifiedCheck( siteId: number | null ) {
	// `is_vip` option is not set in Odyssey, so we need to check `options.is_vip` as well.
	const isVip = useSelector(
		( state ) =>
			!! isVipSite( state as object, siteId as number ) ||
			!! getSiteOption( state, siteId, 'is_vip' )
	);

	const { isPending, data: usageInfo } = usePlanUsageQuery( siteId );
	const isNewSite = useSelector( ( state ) => isSiteNew( state, siteId ) );
	// Use the threshold check from API directly.
	const isExceedingTrafficThreshold = usageInfo?.should_show_paywall;

	// Show paywall if the site exceeds the traffic threshold. Exempt VIP sites.
	const shouldShowPaywall = ! isVip && ! isPending && isExceedingTrafficThreshold;

	return {
		isNewSite,
		isExceedingTrafficThreshold,
		shouldShowPaywall,
		isPending,
	};
}
