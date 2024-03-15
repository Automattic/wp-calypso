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
							page_pattern_count,
							page_preview_pattern,
							regular_pattern_count,
							regular_preview_pattern,
							...restCategory
						} ): Category => ( {
							...restCategory,
							pagePatternCount: page_pattern_count,
							pagePreviewPattern: page_preview_pattern,
							regularPatternCount: regular_pattern_count,
							regularPreviewPattern: regular_preview_pattern,
						} )
					);
				} );
		},
		staleTime: 5 * 60 * 1000,
		...queryOptions,
	};
}

export function usePatternCategories(
	locale: string,
	queryOptions: Omit< UseQueryOptions< Category[] >, 'queryKey' > = {}
) {
	return useQuery< Category[] >( getPatternCategoriesQueryOptions( locale, queryOptions ) );
}
