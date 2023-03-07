import { useMemo } from 'react';
import type { Pattern, Category } from '../types';

const usePatternsMapByCategory = ( patterns: Pattern[], categories: Category[] ) => {
	return useMemo(
		() =>
			categories.reduce( ( categoriesMap: { [ key: string ]: Pattern[] }, category ) => {
				patterns.forEach( ( pattern ) => {
					if ( pattern?.categories?.includes( category.name ) ) {
						const patternsInCategory = categoriesMap[ category.name ] || [];
						patternsInCategory.push( pattern );
						categoriesMap[ category.name ] = patternsInCategory;
					}
				} );
				return categoriesMap;
			}, {} ),
		[ patterns, categories ]
	);
};

export default usePatternsMapByCategory;
