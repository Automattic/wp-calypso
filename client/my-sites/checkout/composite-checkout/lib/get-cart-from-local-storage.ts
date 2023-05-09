import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

// Used by signup; see https://github.com/Automattic/wp-calypso/pull/44206
// These products are likely missing product_id.
export default function getCartFromLocalStorage(): MinimalRequestCartProduct[] {
	try {
		return JSON.parse( window.localStorage.getItem( 'shoppingCart' ) || '[]' );
	} catch ( err ) {
		return [];
	}
}
