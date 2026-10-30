import type { GroupedCartLineItem } from './group-bundle-line-items';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

/**
 * Several identical lines of one product, shown as one line with their count.
 * The cart keeps one line per unit, set apart only by `cart_item_index`.
 */
export interface CartMergedLineItem {
	type: 'merged';
	key: string;
	products: ResponseCartProduct[];
}

export type MergedCartLineItem = GroupedCartLineItem | CartMergedLineItem;

/**
 * Extras that only record a line's position: `cart_item_index` keeps identical
 * lines apart, and the cart endpoint adds `add_sequence` to every line.
 */
const POSITIONAL_EXTRA_KEYS = [ 'cart_item_index', 'add_sequence' ];

/**
 * Lines are identical when everything but their position matches: the
 * product, its term, its meta and the rest of its extras.
 */
function getIdenticalItemKey( product: ResponseCartProduct ): string {
	const sortedExtra = Object.fromEntries(
		Object.entries( product.extra ?? {} )
			.filter( ( [ key ] ) => ! POSITIONAL_EXTRA_KEYS.includes( key ) )
			.sort( ( [ a ], [ b ] ) => a.localeCompare( b ) )
	);
	return JSON.stringify( [
		product.product_slug,
		product.product_id,
		product.meta,
		product.volume,
		sortedExtra,
	] );
}

/**
 * Folds identical lines that ask to be merged (`extra.mergeIdenticalItems`)
 * into one entry at the place of the first, leaving every other entry as it
 * is. A product with a single line stays a plain line.
 */
export function mergeIdenticalLineItems( entries: GroupedCartLineItem[] ): MergedCartLineItem[] {
	const groups = new Map< string, ResponseCartProduct[] >();
	entries.forEach( ( entry ) => {
		if ( entry.type === 'product' && entry.product.extra?.mergeIdenticalItems ) {
			const key = getIdenticalItemKey( entry.product );
			groups.set( key, [ ...( groups.get( key ) ?? [] ), entry.product ] );
		}
	} );
	const placed = new Set< string >();

	return entries.flatMap( ( entry ): MergedCartLineItem[] => {
		if ( entry.type !== 'product' || ! entry.product.extra?.mergeIdenticalItems ) {
			return [ entry ];
		}
		const key = getIdenticalItemKey( entry.product );
		const members = groups.get( key ) ?? [];
		if ( members.length < 2 ) {
			return [ entry ];
		}
		if ( placed.has( key ) ) {
			return [];
		}
		placed.add( key );
		return [ { type: 'merged', key, products: members } ];
	} );
}
