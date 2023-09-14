import { useMemo } from 'react';
import { ORDERED_PATTERN_CATEGORIES } from '../constants';
import type { Category } from '../types';

const useCategoriesOrder = ( categories: Category[] ) => {
	return useMemo(
		() =>
			categories.sort( ( { name: aName }, { name: bName } ) => {
				if ( aName && bName ) {
					// Sort categories according to `ORDERED_PATTERN_CATEGORIES`.
					let aIndex = ORDERED_PATTERN_CATEGORIES.indexOf( aName );
					let bIndex = ORDERED_PATTERN_CATEGORIES.indexOf( bName );
					// All other categories should come after that.
					if ( aIndex < 0 ) {
						aIndex = ORDERED_PATTERN_CATEGORIES.length;
					}
					if ( bIndex < 0 ) {
						bIndex = ORDERED_PATTERN_CATEGORIES.length;
					}
					return aIndex - bIndex;
				}
				return 0;
			} ),
		[ categories ]
	);
};

export default useCategoriesOrder;
