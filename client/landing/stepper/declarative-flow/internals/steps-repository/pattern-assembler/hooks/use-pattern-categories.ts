import { useQuery, UseQueryOptions } from 'react-query';
import wpcom from 'calypso/lib/wp';
import type { Category } from '../types';

const usePatternCategories = (
	siteId: number | undefined,
	queryOptions: UseQueryOptions< any, unknown, Category[] > = {}
): Category[] => {
	const { data } = useQuery< any, unknown, Category[] >(
		[ siteId, 'block-patterns', 'categories' ],
		() => {
			if ( siteId ) {
				return wpcom.req.get( {
					path: `/sites/${ encodeURIComponent( siteId ) }/block-patterns/categories`,
					apiNamespace: 'wp/v2',
				} );
			}
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
	return data ?? [];
};

export default usePatternCategories;
