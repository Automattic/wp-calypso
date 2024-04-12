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
	// `recent_usages` is an array of the most recent 3 months usage data, and `current_usage` is the current month usage data.
	// Note: two of the highest days every month in the last 3 months are excluded before calculating views in `current_usage`.
	const recentMonthlyViews = Math.max(
		usageInfo?.recent_usages[ 0 ]?.views_count ?? 0,
		usageInfo?.recent_usages[ 1 ]?.views_count ?? 0,
		usageInfo?.recent_usages[ 2 ]?.views_count ?? 0,
		usageInfo?.current_usage?.views_count ?? 0
	);
	const isNewSite =
		siteCreatedTimeStamp && new Date( siteCreatedTimeStamp ) > new Date( '2024-01-31' ); // Targeting new sites
	const isExceedingTrafficThreshold = recentMonthlyViews > MIN_MONTHLY_VIEWS_TO_APPLY_PAYWALL; // Targeting all existing sites with views higher than 1000/mth.

	// Show paywall if the site exceeds the traffic threshold. Exempt VIP sites.
	const shouldShowPaywall = ! isVip && ! isPending && ( isNewSite || isExceedingTrafficThreshold );

	return {
		isNewSite,
		isExceedingTrafficThreshold,
		shouldShowPaywall,
		isPending,
	};
}
