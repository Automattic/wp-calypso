import { useQuery, UseQueryOptions } from 'react-query';
import wpcom from 'calypso/lib/wp';
import type { Category } from '../types';

const usePatternCategories = (
	siteId: undefined | number = 0,
	queryOptions: UseQueryOptions< any, unknown, Category[] > = {}
): Category[] => {
	const { data } = useQuery< any, unknown, Category[] >(
		[ siteId, 'block-patterns', 'categories' ],
		() => {
			return wpcom.req.get( {
				path: `/sites/${ encodeURIComponent( siteId ) }/block-patterns/categories`,
				apiNamespace: 'wp/v2',
			} );
		},
		{
			...queryOptions,
			staleTime: Infinity,
			enabled: !! siteId,
			meta: {
				persist: false,
				...queryOptions.meta,
			},
		}
	);
	return data ?? [];
};

export default usePatternCategories;
