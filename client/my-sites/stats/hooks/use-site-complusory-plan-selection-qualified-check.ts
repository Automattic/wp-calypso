import { useSelector } from 'calypso/state';
import { getSiteOption } from 'calypso/state/sites/selectors';
import usePlanUsageQuery from './use-plan-usage-query';

const MIN_MONTHLY_VIEWS_TO_APPLY_PAYWALL = 1000;

export default function useSiteComplusoryPlanSelectionQualifiedCheck( siteId: number | null ) {
	const siteCreatedTimeStamp = useSelector( ( state ) =>
		getSiteOption( state, siteId, 'created_at' )
	) as string;
	const { isPending, data: usageInfo } = usePlanUsageQuery( siteId );
	const recentMonthlyViews = Math.max(
		usageInfo?.recent_usages[ 0 ]?.views_count ?? 0,
		usageInfo?.recent_usages[ 1 ]?.views_count ?? 0,
		usageInfo?.recent_usages[ 2 ]?.views_count ?? 0,
		usageInfo?.current_usage?.views_count ?? 0
	);
	const isNewSite =
		siteCreatedTimeStamp && new Date( siteCreatedTimeStamp ) > new Date( '2024-01-31' ); // Targeting new sites
	const isExistingSampleSite = recentMonthlyViews > MIN_MONTHLY_VIEWS_TO_APPLY_PAYWALL; // Targeting all existing sites with views higher than 1000/mth.

	return {
		isNewSite,
		isExistingSampleSite,
		isQualified: ! isPending && ( isNewSite || isExistingSampleSite ),
		isPending,
	};
}
