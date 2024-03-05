import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { Category } from 'calypso/my-sites/patterns/types';

export function getPatternCategoriesQueryOptions(
	locale: string,
	queryOptions: Omit< UseQueryOptions< Category[] >, 'queryKey' > = {}
): UseQueryOptions< Category[] > {
	return {
		queryKey: [ 'pattern-library', 'categories', locale ],
		queryFn() {
			return wpcom.req.get( `/ptk/categories/${ locale }` );
		},
		staleTime: Infinity,
		...queryOptions,
	};
}

export function usePatternCategories(
	locale: string,
	queryOptions: Omit< UseQueryOptions< Category[] >, 'queryKey' > = {}
) {
	return useQuery< Category[] >( getPatternCategoriesQueryOptions( locale, queryOptions ) );
}
