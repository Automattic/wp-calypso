import { camelCase, mapKeys } from 'lodash';
import { useQuery, UseQueryResult, UseQueryOptions } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';

const useQueryBlockPatterns = (
	siteId: number,
	queryOptions: UseQueryOptions< unknown, unknown, unknown > = {}
): UseQueryResult< unknown > => {
	return useQuery< any, unknown, unknown >(
		[ siteId, 'block-patterns', 'patterns' ],
		() =>
			wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteId ) }/block-patterns/patterns`,
				method: 'GET',
				apiNamespace: 'wp/v2',
			} ),
		{
			...queryOptions,

			select: ( response ) =>
				response.map( ( pattern ) => mapKeys( pattern, ( value, key ) => camelCase( key ) ) ),

			// Our theme offering doesn't change that often, we don't need to
			// re-fetch until the next page refresh.
			staleTime: Infinity,

			meta: {
				// Asks Calypso not to persist the data
				persist: false,
				...queryOptions.meta,
			},
		}
	);
};

export default useQueryBlockPatterns;
