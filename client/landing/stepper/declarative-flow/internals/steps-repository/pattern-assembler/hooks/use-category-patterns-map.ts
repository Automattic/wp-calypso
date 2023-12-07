import { isEnabled } from '@automattic/calypso-config';
import { useMemo } from 'react';
import { PATTERN_CATEGORIES, PATTERN_PAGES_CATEGORIES } from '../constants';
import { isPriorityPattern, isPriorityPatternV1, isPagePattern } from '../utils';
import type { Pattern } from '../types';

type CategoryPatternsMap = Record< string, Pattern[] >;

const createCategoryPatternsMap = ( initialCategories: string[] = [] ): CategoryPatternsMap =>
	initialCategories.reduce(
		( acc, cur ) => ( {
			...acc,
			[ cur ]: [],
		} ),
		{}
	);

const useCategoryPatternsMap = ( patterns: Pattern[] ) => {
	return useMemo( () => {
		const allCategoryPatternsMap = createCategoryPatternsMap();
		const layoutCategoryPatternsMap = createCategoryPatternsMap( PATTERN_CATEGORIES );
		const pageCategoryPatternsMap = createCategoryPatternsMap( PATTERN_PAGES_CATEGORIES );
		const insert = (
			categoryPatternsMap: CategoryPatternsMap,
			category: string,
			pattern: Pattern
		) => {
			if ( ! categoryPatternsMap[ category ] ) {
				categoryPatternsMap[ category ] = [];
			}

			if ( isPriorityPattern( pattern ) ) {
				categoryPatternsMap[ category ].unshift( pattern );
			} else {
				categoryPatternsMap[ category ].push( pattern );
			}
		};
		const insertInOrder = (
			categoryPatternsMap: CategoryPatternsMap,
			category: string,
			pattern: Pattern
		) => {
			if ( ! categoryPatternsMap[ category ] ) {
				categoryPatternsMap[ category ] = [];
			}
			const categoryPatterns = categoryPatternsMap[ category ];
			categoryPatterns.push( pattern );
			// FIXME: Easy to read the ordering but not optimized
			categoryPatternsMap[ category ] = [
				// v2 priority patterns
				...categoryPatterns.filter( isPriorityPattern ),
				// v1 priority patterns
				...( isEnabled( 'pattern-assembler/v2' )
					? categoryPatterns.filter( isPriorityPatternV1 )
					: [] ),
				// Non priority patterns
				...categoryPatterns.filter(
					( pattern: Pattern ) => ! isPriorityPattern( pattern ) && ! isPriorityPatternV1( pattern )
				),
			];
		};

		patterns.forEach( ( pattern ) => {
			Object.keys( pattern.categories ).forEach( ( category ) => {
				const isPage = isPagePattern( pattern );

				insert( allCategoryPatternsMap, category, pattern );
				if ( isPage && pageCategoryPatternsMap.hasOwnProperty( category ) ) {
					insert( pageCategoryPatternsMap, category, pattern );
				}

				if ( ! isPage && layoutCategoryPatternsMap.hasOwnProperty( category ) ) {
					insertInOrder( layoutCategoryPatternsMap, category, pattern );
				}
			} );
		} );

		return {
			allCategoryPatternsMap,
			layoutCategoryPatternsMap,
			pageCategoryPatternsMap,
		};
	}, [ patterns ] );
};

export default useCategoryPatternsMap;
