import { useQuery, UseQueryResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { PriceTierListItemProps } from '../stats-purchase/types';
import getDefaultQueryParams from './default-query-params';

interface PeriodUsage {
	current_start: string | null;
	next_start: string | null;
	views_count: number;
	days_to_reset: number;
}

export interface PlanUsage {
	current_usage: PeriodUsage;
	recent_usages: Array< PeriodUsage >;
	views_limit: number;
	over_limit_months: number;
	current_tier: PriceTierListItemProps;
	is_internal: boolean;
	billable_monthly_views: number;
	should_show_paywall: boolean;
	paywall_date_from: string | null;
	upgrade_deadline_date: string | null;
	validMonthlyViews: number;
}

function selectPlanUsage( payload: PlanUsage ): PlanUsage {
	const recent_usages =
		payload?.recent_usages
			?.map( ( usage ) => usage?.views_count ?? 0 )
			.filter( ( views ) => views > 0 ) ?? [];

	return {
		...payload,
		validMonthlyViews: recent_usages.length > 0 ? Math.min( ...recent_usages ) : 0,
	};
}

function queryPlanUsage( siteId: number | null ): Promise< PlanUsage > {
	return wpcom.req.get( {
		apiNamespace: 'wpcom/v2',
		path: `/sites/${ siteId }/jetpack-stats/usage`,
	} );
}

export default function usePlanUsageQuery(
	siteId: number | null
): UseQueryResult< PlanUsage, unknown > {
	return useQuery( {
		...getDefaultQueryParams< PlanUsage >(),
		staleTime: 10 * 1000, // 10 seconds
		queryKey: [ 'stats', 'usage', 'query', siteId ],
		queryFn: () => queryPlanUsage( siteId ),
		select: selectPlanUsage,
	} );
}
