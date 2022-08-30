import { useQuery, UseQueryResult, UseQueryOptions } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';

const useQueryBlockPatterns = (
	siteId: number,
	queryOptions: UseQueryOptions< unknown, unknown, unknown > = {}
): UseQueryResult< unknown > => {
	return useQuery< any, unknown, unknown >(
		[ siteId, 'block-patterns', 'categories' ],
		() =>
			wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteId ) }/block-patterns/categories`,
				method: 'GET',
				apiNamespace: 'wp/v2',
			} ),
		{
			...queryOptions,

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
