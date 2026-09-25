import { isCategoryTileValue } from './category-tiles';
import type { CategoryTileValue } from './category-tiles';
import type { Filter } from '@wordpress/dataviews';

// Other names a `?category=` link can use for some tiles.
const CATEGORY_ALIASES: Record< string, CategoryTileValue > = {
	'pressable-addon': 'pressable',
	'shipping-delivery-fulfillment': 'shipping',
	'store-content-and-customization': 'store-content',
};

// The filters for a `?category=` link.
export function getInitialCategoryFilters( category?: string ): Filter[] {
	const value = category ? ( CATEGORY_ALIASES[ category ] ?? category ) : null;
	return isCategoryTileValue( value ) ? setTileCategory( [], value ) : [];
}

// A tile is selected when it is the only category set.
export function getTileCategory( filters: Filter[] = [] ): CategoryTileValue | null {
	const categoryFilter = filters.find( ( filter ) => filter.field === 'category' );
	const value = categoryFilter?.value;
	return Array.isArray( value ) && value.length === 1 && isCategoryTileValue( value[ 0 ] )
		? value[ 0 ]
		: null;
}

export function setTileCategory(
	filters: Filter[] = [],
	category: CategoryTileValue | null
): Filter[] {
	return [
		...filters.filter( ( filter ) => filter.field !== 'category' ),
		...( category
			? [ { field: 'category', operator: 'isAny' as const, value: [ category ] } ]
			: [] ),
	];
}

// Unchecking the last category inside the chip leaves an empty filter behind,
// which would show as a blank chip once the field is no longer primary.
export function dropEmptyCategoryFilter( filters: Filter[] = [] ): Filter[] {
	return filters.filter(
		( filter ) =>
			filter.field !== 'category' || ( Array.isArray( filter.value ) && filter.value.length > 0 )
	);
}
