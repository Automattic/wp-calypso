import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { UrlPerformanceInsightsQueryResponse } from './types';

export const useUrlPerformanceInsightsQuery = ( url?: string, hash?: string ) => {
	return useQuery< UrlPerformanceInsightsQueryResponse >( {
		queryKey: [ 'url', 'performance', url, hash ],
		queryFn: () =>
			wp.req.get(
				{
					path: '/site-profiler/metrics/advanced/insights',
					apiNamespace: 'wpcom/v2',
				},
				{ url, hash }
			),
		meta: {
			persist: false,
		},
		enabled: !! url && !! hash,
		retry: false,
		refetchOnWindowFocus: false,
		refetchInterval: ( query ) =>
			query.state.data?.pagespeed?.status === 'completed' &&
			( query.state.data?.wpscan?.status === 'completed' ||
				Object.keys( query.state.data?.wpscan?.errors ?? {} ).length > 0 )
				? false
				: 5000, // 5 second
	} );
};
