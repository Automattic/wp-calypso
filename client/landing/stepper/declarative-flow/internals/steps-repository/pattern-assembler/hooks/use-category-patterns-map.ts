import { useMemo } from 'react';
import { PATTERN_CATEGORIES, PATTERN_PAGES_CATEGORIES } from '../constants';
import { isPriorityPattern, isPagePattern } from '../utils';
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

		patterns.reverse().forEach( ( pattern ) => {
			Object.keys( pattern.categories ).forEach( ( category ) => {
				const isPage = isPagePattern( pattern );

				insert( allCategoryPatternsMap, category, pattern );
				if ( isPage && pageCategoryPatternsMap.hasOwnProperty( category ) ) {
					insert( pageCategoryPatternsMap, category, pattern );
				}

				if ( ! isPage && layoutCategoryPatternsMap.hasOwnProperty( category ) ) {
					insert( layoutCategoryPatternsMap, category, pattern );
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
