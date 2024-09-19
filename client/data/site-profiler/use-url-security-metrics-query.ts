import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { UrlSecurityMetricsQueryResponse } from './types';

function mapResult( response: UrlSecurityMetricsQueryResponse ) {
	return response.wpscan;
}

export const useUrlSecurityMetricsQuery = ( url?: string, hash?: string ) => {
	return useQuery( {
		queryKey: [ 'url', 'security', url, hash ],
		queryFn: () =>
			wp.req.get(
				{
					path: '/site-profiler/metrics/advanced/security',
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
		refetchInterval: ( query ) =>
			query.state.data?.wpscan?.status === 'completed' || query.state.data?.wpscan.errors
				? false
				: 5000, // 5 second	;
	} );
};
