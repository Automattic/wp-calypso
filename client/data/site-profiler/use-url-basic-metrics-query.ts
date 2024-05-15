import { useQuery } from '@tanstack/react-query';
import { Metrics, UrlBasicMetricsQueryResponse } from 'calypso/data/site-profiler/types';
import wp from 'calypso/lib/wp';
import { getScore } from './metrics-dictionaries';

function mapScores( response: UrlBasicMetricsQueryResponse ) {
	const { basic } = response;

	if ( ! basic ) {
		return response;
	}

	const basicMetricsScored = ( Object.entries( basic ) as [ Metrics, number ][] ).reduce<
		Record< Metrics, { value: number; score: string } >
	>(
		( acc, [ key, value ] ) => {
			acc[ key ] = { value: value, score: getScore( key as Metrics, value ) };
			return acc;
		},
		{} as Record< Metrics, { value: number; score: string } >
	);

	return { ...response, basic: basicMetricsScored };
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
				{ url }
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
