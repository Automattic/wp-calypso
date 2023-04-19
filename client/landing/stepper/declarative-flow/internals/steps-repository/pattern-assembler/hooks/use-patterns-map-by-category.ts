import { useMemo } from 'react';
import type { Pattern, Category } from '../types';

const usePatternsMapByCategory = ( patterns: Pattern[], categories: Category[] ) => {
	return useMemo( () => {
		const categoriesMap: Record< string, Pattern[] > = {};

		patterns.forEach( ( pattern ) => {
			// Filter pattern with the meta assembler_waitlist because of rendering issues
			if ( pattern.pattern_meta.assembler_waitlist ) {
				return;
			}
			Object.keys( pattern.categories ).forEach( ( category ) => {
				if ( ! categoriesMap[ category ] ) {
					categoriesMap[ category ] = [];
				}
				categoriesMap[ category ].push( pattern );
			} );
		} );
		return categoriesMap;
	}, [ patterns, categories ] );
};

export default usePatternsMapByCategory;
