/**
 * External dependencies
 */
import type { RequestCartProduct } from '@automattic/shopping-cart';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:cart-local-storage' );

let cartProductsFallbackStorage: Partial< RequestCartProduct >[] = [];

const localStorageKey = 'automatticShoppingCartProducts';

// Used by signup; see https://github.com/Automattic/wp-calypso/pull/44206
// These products are likely missing product_id.
export function getCartFromLocalStorage(): Partial< RequestCartProduct >[] {
	try {
		const products = JSON.parse( window.localStorage.getItem( localStorageKey ) || '[]' );
		if ( Array.isArray( products ) ) {
			return products;
		}
	} catch ( err ) {
		debug( 'An error ocurred reading saved cart products from localStorage: ' + err );
	}
	return cartProductsFallbackStorage;
}

export function addCartItemsToLocalStorage( newItems: Partial< RequestCartProduct >[] ): void {
	const currentItems = getCartFromLocalStorage();
	saveCartItemsToLocalStorage( [ ...currentItems, ...newItems ] );
}

export function saveCartItemsToLocalStorage( newItems: Partial< RequestCartProduct >[] ): void {
	debug( 'saving cart items to localStorage', newItems );
	cartProductsFallbackStorage = newItems;
	try {
		window.localStorage.setItem( localStorageKey, JSON.stringify( newItems ) );
	} catch ( err ) {
		debug( 'An error ocurred writing saved cart products to localStorage: ' + err );
	}
}

export function clearCartFromLocalStorage(): void {
	debug( 'clearing cart items from localStorage' );
	cartProductsFallbackStorage = [];
	try {
		window.localStorage.removeItem( localStorageKey );
	} catch ( err ) {
		debug( 'An error ocurred deleting saved cart products from localStorage: ' + err );
	}
}
