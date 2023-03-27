import { useMemo } from 'react';
import type { Pattern, Category } from '../types';

const usePatternsMapByCategory = ( patterns: Pattern[], categories: Category[] ) => {
	return useMemo( () => {
		const categoriesMap = categories.reduce( ( map, category ) => {
			return category.name
				? {
						...map,
						[ category.name ]: [],
				  }
				: map;
		}, {} ) as { [ key: string ]: Pattern[] };

		patterns.forEach( ( pattern ) => {
			Object.values( pattern.categories ).forEach( ( { slug } ) => {
				if ( slug ) {
					categoriesMap[ slug ]?.push( pattern );
				}
			} );
		} );
		return categoriesMap;
	}, [ patterns, categories ] );
};

export default usePatternsMapByCategory;
