import { getPressableMemoryTarget } from './pressable-memory-addon';
import type { ShoppingCartItem } from '../types';

/**
 * Whether two cart items represent the same purchasable line, and so should be
 * grouped together and counted as multiple copies. Two items match when they
 * share the same product slug, bundle quantity, and target site domain.
 */
export function isSameCartItem( a: ShoppingCartItem, b: ShoppingCartItem ): boolean {
	return (
		a.slug === b.slug &&
		a.quantity === b.quantity &&
		getPressableMemoryTarget( a ) === getPressableMemoryTarget( b )
	);
}

/**
 * Append one more copy of a product to the cart. Unlike a toggle, this always
 * adds, so an agency can buy multiple copies of the same product at once.
 */
export function addCartItem(
	items: ShoppingCartItem[],
	item: ShoppingCartItem
): ShoppingCartItem[] {
	return [ ...items, item ];
}

/**
 * Group duplicate cart items into a list of unique items with their copy count,
 * preserving first-seen order.
 */
export function groupCartItems(
	items: ShoppingCartItem[]
): { item: ShoppingCartItem; count: number }[] {
	const groups: { item: ShoppingCartItem; count: number }[] = [];

	items.forEach( ( item ) => {
		const group = groups.find( ( { item: groupItem } ) => isSameCartItem( groupItem, item ) );
		if ( group ) {
			group.count += 1;
		} else {
			groups.push( { item, count: 1 } );
		}
	} );

	return groups;
}

/**
 * Remove a single instance of the item matching `item`, leaving other copies
 * and other items in place.
 */
export function decrementCartItem(
	items: ShoppingCartItem[],
	item: ShoppingCartItem
): ShoppingCartItem[] {
	const index = items.findIndex( ( cartItem ) => isSameCartItem( cartItem, item ) );
	if ( index === -1 ) {
		return items;
	}
	return items.filter( ( _, i ) => i !== index );
}

/**
 * Remove every instance of the item matching `item`.
 */
export function removeCartItemGroup(
	items: ShoppingCartItem[],
	item: ShoppingCartItem
): ShoppingCartItem[] {
	return items.filter( ( cartItem ) => ! isSameCartItem( cartItem, item ) );
}

/**
 * Add or remove copies of the item matching `item` so the cart holds exactly
 * `count` of them, leaving other items in place. A count of zero removes the
 * group entirely. Returns the same array reference when the count is unchanged.
 */
export function setCartItemCount(
	items: ShoppingCartItem[],
	item: ShoppingCartItem,
	count: number
): ShoppingCartItem[] {
	const current = items.filter( ( cartItem ) => isSameCartItem( cartItem, item ) ).length;

	if ( count === current ) {
		return items;
	}

	if ( count < current ) {
		let toRemove = current - count;
		return items.filter( ( cartItem ) => {
			if ( toRemove > 0 && isSameCartItem( cartItem, item ) ) {
				toRemove -= 1;
				return false;
			}
			return true;
		} );
	}

	const copies = Array.from( { length: count - current }, () => item );
	return [ ...items, ...copies ];
}
