import { useMemo } from 'react';
import type { Pattern, Category } from '../types';

const usePatternsMapByCategory = ( patterns: Pattern[], categories: Category[] ) => {
	return useMemo( () => {
		const categoriesMap = {} as { [ key: string ]: Pattern[] };

		patterns.forEach( ( pattern ) => {
			Object.values( pattern.categories ).forEach( ( { slug } ) => {
				if ( slug ) {
					if ( ! categoriesMap[ slug ] ) {
						categoriesMap[ slug ] = [];
					}
					categoriesMap[ slug ].push( pattern );
				}
			} );
		} );
		return categoriesMap;
	}, [ patterns, categories ] );
};

export default usePatternsMapByCategory;
