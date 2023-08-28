import { useMemo } from 'react';
import type { Category } from '../types';

const patternCategoriesOrder = [ 'posts', 'gallery', 'call-to-action' ];

const useCategoriesOrder = ( categories: Category[] ) => {
	return useMemo(
		() =>
			categories.sort( ( { name: aName }, { name: bName } ) => {
				if ( aName && bName ) {
					// Sort categories according to `patternCategoriesOrder`.
					let aIndex = patternCategoriesOrder.indexOf( aName );
					let bIndex = patternCategoriesOrder.indexOf( bName );
					// All other categories should come after that.
					if ( aIndex < 0 ) {
						aIndex = patternCategoriesOrder.length;
					}
					if ( bIndex < 0 ) {
						bIndex = patternCategoriesOrder.length;
					}
					return aIndex - bIndex;
				}
				return 0;
			} ),
		[ categories ]
	);
};

export default useCategoriesOrder;
