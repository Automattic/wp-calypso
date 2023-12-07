import { useQuery, UseQueryResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

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
}

function selectPlanUsage( payload: PlanUsage ): PlanUsage {
	return payload;
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
		queryKey: [ 'stats', 'usage', siteId ],
		queryFn: () => queryPlanUsage( siteId ),
		select: selectPlanUsage,
		staleTime: 1000 * 60 * 5, // 5 minutes
	} );
}
