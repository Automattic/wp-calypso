/**
 * External dependencies
 */
import type { RequestCartProduct } from '@automattic/shopping-cart';

// Used by signup; see https://github.com/Automattic/wp-calypso/pull/44206
export default function getCartFromLocalStorage(): RequestCartProduct[] {
	try {
		return JSON.parse( window.localStorage.getItem( 'shoppingCart' ) || '[]' );
	} catch ( err ) {
		return [];
	}
}
