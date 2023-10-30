import { useMemo } from 'react';
import { PATTERN_PAGES_CATEGORIES } from '../constants';
import { isPriorityPattern, isPagePattern } from '../utils';
import type { Pattern } from '../types';

const usePatternPagesMapByCategory = ( patterns: Pattern[] ) => {
	return useMemo( () => {
		const categoriesMap: Record< string, Pattern[] > = {};

		patterns.reverse().forEach( ( pattern ) => {
			Object.keys( pattern.categories ).forEach( ( category ) => {
				if ( ! PATTERN_PAGES_CATEGORIES.includes( category ) || ! isPagePattern( pattern ) ) {
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

export default usePatternPagesMapByCategory;
