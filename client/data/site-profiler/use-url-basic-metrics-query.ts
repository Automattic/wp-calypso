import { useQuery } from '@tanstack/react-query';
import { BasicMetricsScored, UrlBasicMetricsQueryResponse } from 'calypso/data/site-profiler/types';
import wp from 'calypso/lib/wp';
import { getBasicMetricsScored } from './metrics-dictionaries';

function mapScores( response: UrlBasicMetricsQueryResponse ) {
	const { basic } = response;

	let basicMetricsScored = {} as BasicMetricsScored;
	if ( basic.success ) {
		basicMetricsScored = getBasicMetricsScored( basic.data );
	}

	return { ...response, success: basic.success, basic: basicMetricsScored };
}

export const useUrlBasicMetricsQuery = (
	url?: string,
	advance = false,
	{ enabled = true } = {}
) => {
	return useQuery( {
		queryKey: [ 'url', 'basic-metrics', url, advance ],
		queryFn: (): Promise< UrlBasicMetricsQueryResponse > =>
			wp.req.get(
				{
					path: '/site-profiler/metrics/basic',
					apiNamespace: 'wpcom/v2',
				},
				{ url, ...( advance ? { advance: '1' } : {} ) }
			),
		select: mapScores,
		meta: {
			persist: false,
		},
		enabled: !! url && enabled,
		retry: false,
		refetchOnWindowFocus: false,
	} );
};
