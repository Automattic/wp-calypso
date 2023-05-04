import { isEnabled } from '@automattic/calypso-config';
import { shuffle } from '@automattic/js-utils';
import { useMemo } from 'react';
import type { Pattern } from '../types';

const useCategoryAll = ( dotcomPatterns: Pattern[] ) => {
	// Add all patterns to the category All
	return useMemo( () => {
		if ( ! dotcomPatterns.length || ! isEnabled( 'pattern-assembler/all-patterns-category' ) ) {
			return dotcomPatterns;
		}
		// Shuffle patterns for better stats of popular patterns
		return shuffle(
			dotcomPatterns.map( ( pattern ) => ( {
				...pattern,
				categories: {
					...pattern.categories,
					all: {
						slug: 'all',
					},
				},
			} ) )
		);
	}, [ dotcomPatterns ] );
};

export default useCategoryAll;
