import { getPressableMemoryTarget, isPressablePhpMemoryAddon } from './pressable-memory-addon';
import type { ShoppingCartItem } from '../types';

/**
 * The most copies of a single product an agency can add to the cart.
 */
export const MAX_CART_ITEM_COUNT = 10;

/**
 * The most copies allowed for a given item. Pressable RAM addons are purchased
 * once per site, so they are capped at a single copy; everything else shares the
 * global maximum.
 */
export function getMaxCartItemCount( item: Pick< ShoppingCartItem, 'slug' > ): number {
	return isPressablePhpMemoryAddon( item ) ? 1 : MAX_CART_ITEM_COUNT;
}

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
 * Append one more copy of a product to the cart, so an agency can buy multiple
 * copies of the same product at once. Adding stops at the item's maximum copy
 * count; once reached the cart is returned unchanged.
 */
export function addCartItem(
	items: ShoppingCartItem[],
	item: ShoppingCartItem
): ShoppingCartItem[] {
	const current = items.filter( ( cartItem ) => isSameCartItem( cartItem, item ) ).length;

	if ( current >= getMaxCartItemCount( item ) ) {
		return items;
	}

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
