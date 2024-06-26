import { useSelector } from 'calypso/state';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import { getSiteOption } from 'calypso/state/sites/selectors';
import usePlanUsageQuery from './use-plan-usage-query';

const MIN_MONTHLY_VIEWS_TO_APPLY_PAYWALL = 1000;

export default function useSiteCompulsoryPlanSelectionQualifiedCheck( siteId: number | null ) {
	const siteCreatedTimeStamp = useSelector( ( state ) =>
		getSiteOption( state, siteId, 'created_at' )
	) as string;

	// `is_vip` option is not set in Odyssey, so we need to check `options.is_vip` as well.
	const isVip = useSelector(
		( state ) =>
			!! isVipSite( state as object, siteId as number ) ||
			!! getSiteOption( state, siteId, 'is_vip' )
	);

	const { isPending, data: usageInfo } = usePlanUsageQuery( siteId );
	const isNewSite =
		siteCreatedTimeStamp && new Date( siteCreatedTimeStamp ) > new Date( '2024-01-31' ); // Targeting new sites
	const isExceedingTrafficThreshold =
		( usageInfo?.validMonthlyViews ?? 0 ) > MIN_MONTHLY_VIEWS_TO_APPLY_PAYWALL; // Targeting all existing sites with views higher than 1000/mth.

	// Show paywall if the site exceeds the traffic threshold. Exempt VIP sites.
	const shouldShowPaywall = ! isVip && ! isPending && ( isNewSite || isExceedingTrafficThreshold );

	return {
		isNewSite,
		isExceedingTrafficThreshold,
		shouldShowPaywall,
		isPending,
	};
}
