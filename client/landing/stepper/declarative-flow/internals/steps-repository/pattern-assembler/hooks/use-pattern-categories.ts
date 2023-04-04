import { useQuery, UseQueryResult, UseQueryOptions } from 'react-query';
import wpcom from 'calypso/lib/wp';

const usePatternCategories = (
	siteId: number | undefined,
	queryOptions: UseQueryOptions = {}
): UseQueryResult => {
	return useQuery< any, unknown, unknown >(
		[ siteId, 'block-patterns', 'categories' ],
		() => {
			if ( ! siteId ) {
				return [];
			}

			return wpcom.req.get( {
				path: `/sites/${ encodeURIComponent( siteId ) }/block-patterns/categories`,
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

export default usePatternCategories;
