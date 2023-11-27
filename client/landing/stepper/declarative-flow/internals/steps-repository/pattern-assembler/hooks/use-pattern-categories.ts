import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { Category } from '../types';

const usePatternCategories = (
	siteId: undefined | number = 0,
	queryOptions: Omit< UseQueryOptions< any, unknown, Category[] >, 'queryKey' > = {}
): Category[] => {
	const { data } = useQuery< any, unknown, Category[] >( {
		queryKey: [ siteId, 'block-patterns', 'categories' ],
		queryFn: () => {
			return wpcom.req.get( {
				path: `/sites/${ encodeURIComponent( siteId ) }/block-patterns/categories`,
				apiNamespace: 'wp/v2',
			} );
		},
		...queryOptions,
		staleTime: Infinity,
		enabled: !! siteId,
		meta: {
			persist: false,
			...queryOptions.meta,
		},
	} );
	return data ?? [];
};

export default usePatternCategories;
