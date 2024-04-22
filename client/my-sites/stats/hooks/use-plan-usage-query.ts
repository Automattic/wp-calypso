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
	billableMonthlyViews: number;
}

function selectPlanUsage( payload: PlanUsage ): PlanUsage {
	let billableMonthlyViews = 0;
	const recent_usages = payload?.recent_usages
		?.map( ( usage ) => usage?.views_count ?? 0 )
		.filter( ( views ) => views > 0 );
	if ( payload?.current_usage?.views_count > 0 ) {
		recent_usages.push( payload.current_usage.views_count );
	}

	if ( recent_usages.length === 1 ) {
		// Only one number non-zero, use it.
		billableMonthlyViews = recent_usages[ 0 ];
	} else if ( recent_usages.length === 2 ) {
		// Two numbers non-zero, use the average.
		billableMonthlyViews = ( recent_usages[ 0 ] + recent_usages[ 1 ] ) / 2;
	} else if ( recent_usages.length === 3 ) {
		// Three numbers non-zero, use the middle one.
		billableMonthlyViews = recent_usages[ 1 ];
	} else if ( recent_usages.length === 4 ) {
		// Four numbers non-zero, use the average of the second and third.
		billableMonthlyViews = ( recent_usages[ 1 ] + recent_usages[ 2 ] ) / 2;
	}

	return {
		...payload,
		billableMonthlyViews,
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
		queryKey: [ 'stats', 'usage', 'query', siteId ],
		queryFn: () => queryPlanUsage( siteId ),
		select: selectPlanUsage,
	} );
}
