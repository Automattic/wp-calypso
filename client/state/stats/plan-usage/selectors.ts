import { get } from 'lodash';
import { PlanUsage } from 'calypso/my-sites/stats/hooks/use-plan-usage-query';

import 'calypso/state/stats/init';

export function getPlanUsageBillableMonthlyViews( state: object, siteId: number | null ) {
	if ( ! siteId ) {
		return 0;
	}

	const data = get( state, [ 'stats', 'planUsage', 'data', siteId ], null ) as PlanUsage;
	// TODO: Use `data.billable_monthly_views` instead?
	const recentViews =
		data?.recent_usages
			?.map( ( usage ) => usage?.views_count ?? 0 )
			.filter( ( views ) => views > 0 ) ?? [];

	return recentViews.length > 0 ? Math.min( ...recentViews ) : 0;
}

export function getCurrentUsagePastDays( state: object, siteId: number | null ): number {
	if ( ! siteId ) {
		return 0;
	}

	const data = get( state, [ 'stats', 'planUsage', 'data', siteId ], null ) as PlanUsage;

	return data?.current_usage.past_days;
}
