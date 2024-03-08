import { useMemo } from 'react';
import type { Category } from '../types';

const useCategoriesOrder = ( categories: Category[], orderList: string[] ) => {
	return useMemo(
		() =>
			categories.sort( ( { name: aName }, { name: bName } ) => {
				if ( aName && bName ) {
					// Sort categories according to the orderList.
					let aIndex = orderList.indexOf( aName );
					let bIndex = orderList.indexOf( bName );
					// All other categories should come after that.
					if ( aIndex < 0 ) {
						aIndex = orderList.length;
					}
					if ( bIndex < 0 ) {
						bIndex = orderList.length;
					}
					return aIndex - bIndex;
				}
				return 0;
			} ),
		[ categories, orderList ]
	);
};

export default useCategoriesOrder;
