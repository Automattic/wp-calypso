import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useEffect } from 'react';
import wpcom from 'calypso/lib/wp';
import { CATEGORY_FEATURED, CATEGORY_PAGE } from 'calypso/my-sites/patterns/constants';
import { Pattern, PatternTypeFilter } from 'calypso/my-sites/patterns/types';

interface PatternCount {
	[ key: string ]: number;
}

interface PatternCounts {
	[ PatternTypeFilter.PAGES ]: PatternCount;
	[ PatternTypeFilter.REGULAR ]: PatternCount;
}

function getQueryKey( locale: string, category: string ) {
	return [ 'pattern-library', 'patterns', locale, category ];
}

export function getPatternsQueryOptions(
	locale: string,
	category: string,
	queryOptions: Omit< UseQueryOptions< Pattern[] >, 'queryKey' | 'select' > = {}
): UseQueryOptions< Pattern[] > {
	return {
		queryKey: getQueryKey( locale, category ),
		queryFn() {
			return wpcom.req.get( `/ptk/patterns/${ locale }`, {
				categories: category,
				post_type: 'wp_block',
			} );
		},
		staleTime: 5 * 60 * 1000,
		...queryOptions,
		select( patterns ) {
			const patternCounts: PatternCounts = {
				[ PatternTypeFilter.PAGES ]: {},
				[ PatternTypeFilter.REGULAR ]: {},
			};

			// Limits the number of patterns that can be copied to the first three patterns from each category
			for ( const pattern of patterns ) {
				const categoryNames = Object.keys( pattern.categories );

				const patternType = categoryNames.includes( CATEGORY_PAGE )
					? PatternTypeFilter.PAGES
					: PatternTypeFilter.REGULAR;

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

			return patterns;
		},
	};
}

export function usePatterns(
	locale: string,
	category: string,
	queryOptions: Omit< UseQueryOptions< Pattern[] >, 'queryKey' | 'select' > = {}
) {
	const queryClient = useQueryClient();
	const queryResult = useQuery< Pattern[] >(
		getPatternsQueryOptions( locale, category, queryOptions )
	);

	// When users submit a search, we fetch *all* patterns. This callback groups the returned
	// patterns by category and populates the react-query cache for each category.
	useEffect( () => {
		if ( category === '' && queryResult.data?.length ) {
			const patternsByCategory: Record< string, Pattern[] > = {};

			for ( const pattern of queryResult.data ) {
				for ( const categoryName of Object.keys( pattern.categories ) ) {
					if ( ! patternsByCategory[ categoryName ] ) {
						patternsByCategory[ categoryName ] = [ pattern ];
					} else {
						patternsByCategory[ categoryName ].push( pattern );
					}
				}
			}

			for ( const [ categoryName, patterns ] of Object.entries( patternsByCategory ) ) {
				const queryKey = getQueryKey( locale, categoryName );
				const queryData = queryClient.getQueryData( queryKey );

				if ( ! queryData ) {
					queryClient.setQueryData( queryKey, patterns );
					// We immediately invalidate the pre-populated query data to make react-query
					// refetch it when users navigate to that category
					queryClient.invalidateQueries( { queryKey } );
				}
			}
		}
	}, [ category, locale, queryResult.dataUpdatedAt ] );

	return queryResult;
}
