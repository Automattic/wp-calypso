import { shuffle } from '@automattic/js-utils';
import { useMemo } from 'react';
import { CATEGORY_ALL_SLUG } from '../constants';
import type { Pattern } from '../types';

const useCategoryAll = ( dotcomPatterns: Pattern[] ) => {
	// Add all patterns to the category All
	return useMemo( () => {
		if ( ! dotcomPatterns.length ) {
			return dotcomPatterns;
		}
		// Shuffle patterns for better stats of popular patterns
		return shuffle(
			dotcomPatterns.map( ( pattern ) => ( {
				...pattern,
				categories: {
					...pattern.categories,
					[ CATEGORY_ALL_SLUG ]: {
						slug: CATEGORY_ALL_SLUG,
					},
				},
			} ) )
		);
	}, [ dotcomPatterns ] );
};

export default useCategoryAll;
