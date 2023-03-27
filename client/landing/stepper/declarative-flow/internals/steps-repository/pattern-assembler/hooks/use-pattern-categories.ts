import { useQuery, UseQueryOptions } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { Category } from '../types';

const usePatternCategories = (
	siteId = 0,
	queryOptions: UseQueryOptions< any, unknown, Category[] > = {}
): Category[] => {
	const { data } = useQuery< any, unknown, Category[] >(
		[ siteId, 'block-patterns', 'categories' ],
		() => {
			return wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteId ) }/block-patterns/categories`,
				method: 'GET',
				apiNamespace: 'wp/v2',
			} );
		},
		{
			...queryOptions,
			enabled: !! siteId,
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
