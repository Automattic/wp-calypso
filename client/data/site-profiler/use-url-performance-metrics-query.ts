import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { UrlPerformanceMetricsQueryResponse } from './types';

function mapResult( response: UrlPerformanceMetricsQueryResponse ) {
	return response.webtestpage_org.report;
}

export const useUrlPerformanceMetricsQuery = ( url?: string, hash?: string ) => {
	return useQuery( {
		queryKey: [ 'url', 'performance', url, hash ],
		queryFn: () =>
			wp.req.get(
				{
					path: '/site-profiler/metrics/advanced/performance',
					apiNamespace: 'wpcom/v2',
				},
				{ url, hash }
			),
		meta: {
			persist: false,
		},
		select: mapResult,
		enabled: !! url,
		retry: false,
		refetchOnWindowFocus: false,
	} );
};
