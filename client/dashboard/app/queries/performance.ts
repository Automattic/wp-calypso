import { fetchBasicMetrics, fetchPerformanceInsights } from '../../data/site-profiler';
import type { UrlPerformanceInsights } from '../../data/site-profiler';
import type { Query } from '@tanstack/react-query';

export const basicMetricsQuery = ( url: string ) => ( {
	queryKey: [ 'performance', url, 'basic-metrics' ],
	queryFn: () => fetchBasicMetrics( url ),
} );

export const performanceInsightsQuery = ( url: string, token: string ) => ( {
	queryKey: [ 'performance', url, token ],
	queryFn: () => {
		return fetchPerformanceInsights( url, token );
	},
	refetchInterval: ( query: Query< UrlPerformanceInsights > ) => {
		if ( query.state.data?.pagespeed?.status === 'completed' ) {
			return false;
		}
		return 5000;
	},
} );
