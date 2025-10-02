import {
	fetchBasicMetrics,
	fetchSitePerformanceInsights,
	fetchSitePerformancePages,
} from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const basicMetricsQuery = ( url: string ) =>
	queryOptions( {
		queryKey: [ 'performance', url, 'basic-metrics' ],
		queryFn: () => fetchBasicMetrics( url ),
	} );

export const sitePerformanceInsightsQuery = ( url: string, token: string ) =>
	queryOptions( {
		queryKey: [ 'performance', url, token ],
		queryFn: () => fetchSitePerformanceInsights( url, token ),
		refetchInterval: ( query ) => {
			if ( query.state.data?.pagespeed?.status === 'completed' ) {
				return false;
			}
			return 5000;
		},
	} );

export function sitePerformancePagesQuery( siteId: number ) {
	return queryOptions( {
		queryKey: [ 'sites', siteId, 'performance-pages' ],
		queryFn: () => fetchSitePerformancePages( siteId ),
	} );
}
