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
			dotcomPatterns.map( ( pattern ) => {
				const isHeader = pattern.categories.header;
				const isFooter = pattern.categories.footer;

				if ( isHeader || isFooter ) {
					// Exclude headers and footers
					return pattern;
				}

				return {
					...pattern,
					categories: {
						...pattern.categories,
						// Add category all to patterns
						[ CATEGORY_ALL_SLUG ]: {
							slug: CATEGORY_ALL_SLUG,
						},
					},
				};
			} )
		);
	}, [ dotcomPatterns ] );
};

export default useCategoryAll;
