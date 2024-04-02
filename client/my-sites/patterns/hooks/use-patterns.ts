import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { CATEGORY_FEATURED, CATEGORY_PAGE } from 'calypso/my-sites/patterns/constants';
import type { Pattern } from 'calypso/my-sites/patterns/types';

interface PatternCount {
	[ key: string ]: number;
}

interface PatternCounts {
	page: PatternCount;
	regular: PatternCount;
}

export function getPatternsQueryOptions(
	locale: string,
	category: string,
	queryOptions: Omit< UseQueryOptions< Pattern[] >, 'queryKey' > = {}
) {
	return {
		queryKey: [ 'pattern-library', 'patterns', locale, category ],
		queryFn() {
			return wpcom.req.get( `/ptk/patterns/${ locale }`, {
				categories: category,
				post_type: 'wp_block',
			} );
		},
		staleTime: 5 * 60 * 1000,
		...queryOptions,
		select( patterns: Pattern[] ) {
			const patternCounts: PatternCounts = {
				page: {},
				regular: {},
			};

			// Limits the number of patterns that can be copied to the first three patterns from each category
			for ( const pattern of patterns ) {
				const categoryNames = Object.keys( pattern.categories );

				const patternType = categoryNames.includes( CATEGORY_PAGE ) ? 'page' : 'regular';

				for ( const categoryName of categoryNames ) {
					// Skips categories that are not used for navigation
					if ( [ CATEGORY_FEATURED, CATEGORY_PAGE ].includes( categoryName ) ) {
						continue;
					}

					patternCounts[ patternType ][ categoryName ] =
						( patternCounts[ patternType ][ categoryName ] ?? 0 ) + 1;

					pattern.can_be_copied_without_account = patternCounts[ patternType ][ categoryName ] <= 3;
				}
			}

			if ( queryOptions.select ) {
				return queryOptions.select( patterns );
			}

			return patterns;
		},
	};
}

export function usePatterns(
	locale: string,
	category: string,
	queryOptions: Omit< UseQueryOptions< Pattern[] >, 'queryKey' > = {}
) {
	return useQuery< Pattern[] >( getPatternsQueryOptions( locale, category, queryOptions ) );
}
