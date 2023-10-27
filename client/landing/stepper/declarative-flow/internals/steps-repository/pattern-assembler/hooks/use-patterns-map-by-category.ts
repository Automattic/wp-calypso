import { useMemo } from 'react';
import { PATTERN_CATEGORIES } from '../constants';
import { isPriorityPattern, isPagePattern } from '../utils';
import type { Pattern } from '../types';

const usePatternsMapByCategory = ( patterns: Pattern[] ) => {
	return useMemo( () => {
		const categoriesMap: Record< string, Pattern[] > = {};

		patterns.reverse().forEach( ( pattern ) => {
			Object.keys( pattern.categories ).forEach( ( category ) => {
				if ( ! PATTERN_CATEGORIES.includes( category ) || isPagePattern( pattern ) ) {
					// Only show patterns (not pages) in allowed categories
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
	}, [ patterns ] );
};

export default usePatternsMapByCategory;
