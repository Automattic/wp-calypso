import { useMemo } from 'react';
import type { Category } from '../types';

const patternCategoriesOrder = [
	'featured',
	'posts',
	'text',
	'gallery',
	'images',
	'call-to-action',
	'banner',
];

const useCategoriesOrder = ( categories: Category[] ) => {
	return useMemo(
		() =>
			categories.sort( ( { name: currentName }, { name: nextName } ) => {
				// The pattern categories should be ordered as follows:
				// 1. The categories from `patternCategoriesOrder` in that specific order should be at the top.
				// 2. The rest categories should be at the bottom without any re-ordering.
				// 3. Any tailored order by intent?
				if (
					! [ currentName, nextName ].some( ( categoryName ) =>
						patternCategoriesOrder.includes( categoryName )
					)
				) {
					return 0;
				}
				if (
					[ currentName, nextName ].every( ( categoryName ) =>
						patternCategoriesOrder.includes( categoryName )
					)
				) {
					return (
						patternCategoriesOrder.indexOf( currentName ) -
						patternCategoriesOrder.indexOf( nextName )
					);
				}
				return patternCategoriesOrder.includes( currentName ) ? -1 : 1;
			} ),
		[ categories ]
	);
};

export default useCategoriesOrder;
