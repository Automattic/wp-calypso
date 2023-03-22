import { useMemo } from 'react';
import type { Pattern, Category } from '../types';

const usePatternsMapByCategory = ( patterns: Pattern[], categories: Category[] ) => {
	return useMemo( () => {
		const categoriesMap = categories.reduce(
			( map, category ) => ( {
				...map,
				[ category.name ]: [],
			} ),
			{}
		) as { [ key: string ]: Pattern[] };

		patterns.forEach( ( pattern ) => {
			pattern.categories.forEach( ( category ) => {
				categoriesMap[ category ]?.push( pattern );
			} );
		} );
		return categoriesMap;
	}, [ patterns, categories ] );
};

export default usePatternsMapByCategory;
