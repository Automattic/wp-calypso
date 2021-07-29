/**
 * External dependencies
 */
import type { RequestCartProduct } from '@automattic/shopping-cart';

// Used by signup; see https://github.com/Automattic/wp-calypso/pull/44206
// These products are likely missing product_id.
export function getCartFromLocalStorage(): Partial< RequestCartProduct >[] {
	try {
		return JSON.parse( window.localStorage.getItem( 'shoppingCart' ) || '[]' );
	} catch ( err ) {
		return [];
	}
}

export function addCartItemsToLocalStorage( newItems: Partial< RequestCartProduct >[] ): void {
	const currentItems = getCartFromLocalStorage();
	saveCartItemsToLocalStorage( [ ...currentItems, ...newItems ] );
}

export function saveCartItemsToLocalStorage( newItems: Partial< RequestCartProduct >[] ): void {
	window.localStorage.setItem( 'shoppingCart', JSON.stringify( newItems ) );
}

export function clearCartFromLocalStorage(): void {
	window.localStorage.removeItem( 'shoppingCart' );
}
