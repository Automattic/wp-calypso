import { useQuery, UseQueryResult, UseQueryOptions } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';

const usePatternCategoriesFromAPI = (
	siteId: number | undefined,
	queryOptions: UseQueryOptions = {}
): UseQueryResult => {
	return useQuery< any, unknown, unknown >(
		[ siteId, 'block-patterns', 'categories' ],
		() => {
			if ( ! siteId ) {
				return [];
			}

			return wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteId ) }/block-patterns/categories`,
				method: 'GET',
				apiNamespace: 'wp/v2',
			} );
		},
		{
			...queryOptions,
			staleTime: Infinity,
			meta: {
				persist: false,
				...queryOptions.meta,
			},
		}
	);
};

export default usePatternCategoriesFromAPI;
