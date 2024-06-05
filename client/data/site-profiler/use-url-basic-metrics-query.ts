import { useQuery } from '@tanstack/react-query';
import {
	BasicMetricsList,
	BasicMetricsScored,
	Metrics,
	UrlBasicMetricsQueryResponse,
} from 'calypso/data/site-profiler/types';
import wp from 'calypso/lib/wp';
import { getScore } from './metrics-dictionaries';

function mapScores( response: UrlBasicMetricsQueryResponse ) {
	const { basic } = response;

	let basicMetricsScored = {} as BasicMetricsScored;
	if ( basic.success ) {
		basicMetricsScored = ( Object.entries( basic.data ) as BasicMetricsList ).reduce(
			( acc, [ key, value ] ) => {
				acc[ key ] = { value: value, score: getScore( key as Metrics, value ) };
				return acc;
			},
			{} as BasicMetricsScored
		);
	}

	return { ...response, success: basic.success, basic: basicMetricsScored };
}

export const useUrlBasicMetricsQuery = ( url?: string ) => {
	return useQuery( {
		queryKey: [ 'url-', url ],
		queryFn: (): Promise< UrlBasicMetricsQueryResponse > =>
			wp.req.get(
				{
					path: '/site-profiler/metrics/basic',
					apiNamespace: 'wpcom/v2',
				},
				{ url, advance: '1' }
			),
		select: mapScores,
		meta: {
			persist: false,
		},
		enabled: !! url,
		retry: false,
		refetchOnWindowFocus: false,
	} );
};
