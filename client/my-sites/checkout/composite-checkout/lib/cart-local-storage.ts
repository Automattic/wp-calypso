/**
 * External dependencies
 */
import type { RequestCartProduct } from '@automattic/shopping-cart';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:cart-local-storage' );

let cartProductsFallbackStorage: Partial< RequestCartProduct >[] = [];

const localStorageKey = 'automatticShoppingCartProducts';

function isLocalStorageAvailable(): boolean {
	try {
		const storage = window.localStorage;
		const x = '__storage_test__';
		storage.setItem( x, x );
		const y = storage.getItem( x );
		storage.removeItem( x );
		return x === y;
	} catch {
		return false;
	}
}

export function getCartFromLocalStorage(): Partial< RequestCartProduct >[] {
	if ( ! isLocalStorageAvailable() ) {
		debug( 'localStorage not available for getting; using fallback' );
		return cartProductsFallbackStorage;
	}
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
	if ( ! isLocalStorageAvailable() ) {
		debug( 'localStorage not available for saving; using fallback' );
		return;
	}
	try {
		window.localStorage.setItem( localStorageKey, JSON.stringify( newItems ) );
	} catch ( err ) {
		debug( 'An error ocurred writing saved cart products to localStorage: ' + err );
	}
}

export function clearCartFromLocalStorage(): void {
	debug( 'clearing cart items from localStorage' );
	cartProductsFallbackStorage = [];
	if ( ! isLocalStorageAvailable() ) {
		debug( 'localStorage not available for clearing; using fallback' );
		return;
	}
	try {
		window.localStorage.removeItem( localStorageKey );
	} catch ( err ) {
		debug( 'An error ocurred deleting saved cart products from localStorage: ' + err );
	}
}
