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
	hash?: string,
	advance = false,
	locale?: string | null
) => {
	return useQuery( {
		queryKey: [ 'url', 'basic-metrics', url, advance, locale ],
		queryFn: (): Promise< UrlBasicMetricsQueryResponse > =>
			wp.req.get(
				{
					path: '/site-profiler/metrics/basic',
					apiNamespace: 'wpcom/v2',
				},
				{ url, ...( advance ? { advance: '1' } : {} ), locale }
			),
		select: mapScores,
		meta: {
			persist: false,
		},
		enabled: !! url && ! hash, // Disable if hash is present
		retry: false,
		refetchOnWindowFocus: false,
	} );
};
