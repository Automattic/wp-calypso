import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { UrlPerformanceInsightsQueryResponse } from './types';

function mapResult( response: UrlPerformanceInsightsQueryResponse ) {
	return response.pagespeed;
}

export const useUrlPerformanceInsightsQuery = (
	url?: string,
	hash?: string,
	locale?: string | null
) => {
	return useQuery( {
		queryKey: [ 'url', 'performance', url, hash, locale ],
		queryFn: () =>
			wp.req.get(
				{
					path: '/site-profiler/metrics/advanced/insights',
					apiNamespace: 'wpcom/v2',
				},
				{ url, hash, locale }
			),
		meta: {
			persist: false,
		},
		select: mapResult,
		enabled: !! url && !! hash,
		retry: false,
		refetchOnWindowFocus: false,
		refetchInterval: ( query ) =>
			query.state.data?.pagespeed?.status === 'completed' ? false : 5000, // 5 second
	} );
};
