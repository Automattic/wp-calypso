import { useMemo } from 'react';
import { PATTERN_CATEGORIES } from '../constants';
import { isPriorityPattern } from '../utils';
import type { Pattern, Category } from '../types';

const usePatternsMapByCategory = ( patterns: Pattern[], categories: Category[] ) => {
	return useMemo( () => {
		const categoriesMap: Record< string, Pattern[] > = {};

		patterns.forEach( ( pattern ) => {
			Object.keys( pattern.categories ).forEach( ( category ) => {
				if ( ! PATTERN_CATEGORIES.includes( category ) ) {
					// Only show allowed categories
					return;
				}
				if ( ! categoriesMap[ category ] ) {
					categoriesMap[ category ] = [];
				}
				if ( isPriorityPattern( pattern ) ) {
					categoriesMap[ category ].unshift( pattern );
				} else {
					categoriesMap[ category ].push( pattern );
				}
			} );
		} );
		return categoriesMap;
	}, [ patterns, categories ] );
};

export default usePatternsMapByCategory;
