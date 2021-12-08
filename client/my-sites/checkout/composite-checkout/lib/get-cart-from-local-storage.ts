import { IncompleteRequestCartProduct } from 'calypso/lib/cart-values/cart-items';

// Used by signup; see https://github.com/Automattic/wp-calypso/pull/44206
// These products are likely missing product_id.
export default function getCartFromLocalStorage(): IncompleteRequestCartProduct[] {
	try {
		return JSON.parse( window.localStorage.getItem( 'shoppingCart' ) || '[]' );
	} catch ( err ) {
		return [];
	}
}
