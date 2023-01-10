import { useLocale } from '@automattic/i18n-utils';
import { useQuery, UseQueryResult } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { Pattern } from './types';

/**
 * This query isn't really a query, it's just meant to use Calypso's react-query async storage to store the order for the user forever
 *
 * @param length the length of the array to order
 * @returns an array of numbers in a random order
 */
function useOrder( length: number ) {
	return useQuery(
		[ 'ptk/order', length ],
		async () => {
			const indices = Array.from( { length }, ( _, i ) => i );
			const firstFour = indices.slice( 0, 4 ).sort( () => Math.random() - 0.5 );
			const theRest = indices.slice( 4 );
			return [ ...firstFour, ...theRest ];
		},
		{
			staleTime: Infinity,
			enabled: length > 0,
		}
	);
}

const useQueryPatterns = ( siteSlug: string ): UseQueryResult< Pattern[] > => {
	const locale = useLocale();
	const params = new URLSearchParams( {
		site: siteSlug,
		tags: 'pattern',
		http_envelope: '1',
	} );

	const queryResult = useQuery< Pattern[] >(
		[ 'ptk/patterns', siteSlug, locale ],
		() =>
			wpcomRequest( {
				apiNamespace: 'rest/v1',
				path: `/ptk/patterns/${ locale }`,
				query: params.toString(),
			} ),
		{
			refetchOnMount: 'always',
			staleTime: Infinity,
		}
	);

	const { data: order } = useOrder( queryResult.data?.length ?? 0 );

	if ( queryResult.data && order ) {
		queryResult.data = order.map( ( index ) => queryResult.data[ index ] );
	}

	return queryResult;
};

export default useQueryPatterns;
