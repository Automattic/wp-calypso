import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { Category, CategorySnakeCase } from 'calypso/my-sites/patterns/types';

export function getPatternCategoriesQueryOptions(
	locale: string,
	queryOptions: Omit< UseQueryOptions< Category[] >, 'queryKey' > = {}
): UseQueryOptions< Category[] > {
	return {
		queryKey: [ 'pattern-library', 'categories', locale ],
		queryFn() {
			return wpcom.req
				.get( `/ptk/categories/${ locale }` )
				.then( ( categories: CategorySnakeCase[] ) => {
					return categories.map(
						( {
							regular_cattern_count,
							pattern_preview,
							page_pattern_count,
							...restCategory
						} ) => ( {
							...restCategory,
							pagePatternCount: page_pattern_count,
							patternPreview: pattern_preview,
							regularPatternCount: regular_cattern_count,
						} )
					);
				} );
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
