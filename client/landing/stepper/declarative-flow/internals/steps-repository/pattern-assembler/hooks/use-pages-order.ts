import { useMemo } from 'react';
import { ORDERED_PAGES_CATEGORIES } from '../constants';
import type { Category } from '../types';

const usePagesOrder = ( categories: Category[] ) => {
	return useMemo(
		() =>
			categories.sort( ( { name: aName }, { name: bName } ) => {
				if ( aName && bName ) {
					// Sort categories according to `ORDERED_PAGES_CATEGORIES`.
					let aIndex = ORDERED_PAGES_CATEGORIES.indexOf( aName );
					let bIndex = ORDERED_PAGES_CATEGORIES.indexOf( bName );
					// All other categories should come after that.
					if ( aIndex < 0 ) {
						aIndex = ORDERED_PAGES_CATEGORIES.length;
					}
					if ( bIndex < 0 ) {
						bIndex = ORDERED_PAGES_CATEGORIES.length;
					}
					return aIndex - bIndex;
				}
				return 0;
			} ),
		[ categories ]
	);
};

export default usePagesOrder;
