/**
 * Converts an array of items (objects) into tuple
 * with first item of the tuple being the array of popular items
 * and second item being an array of the rest of the items.
 */
export const isolatePopularItems = < Item extends { productSlug: string } >(
	allItems: Array< Item >,
	popularItemSlugs: Array< Item[ 'productSlug' ] >
) => {
	const popularItems: typeof allItems = [];
	const otherItems: typeof allItems = [];

	for ( const item of allItems ) {
		if ( popularItemSlugs.includes( item.productSlug ) ) {
			popularItems.push( item );
		} else {
			otherItems.push( item );
		}
	}

	return [ popularItems, otherItems ] as const;
};
