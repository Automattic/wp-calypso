import { createShoppingCartManagerClient } from '@automattic/shopping-cart';
import wp from 'calypso/lib/wp';
import type { RequestCart, CartKey } from '@automattic/shopping-cart';

const wpcomGetCart = ( cartKey: CartKey ) => {
	let source;
	try {
		source = window?.location?.pathname;
	} catch {
		// Ignore failures here if window is not present.
	}
	return wp.req.get( `/me/shopping-cart/${ cartKey }?source=${ source ?? 'unknown' }` );
};
const wpcomSetCart = ( cartKey: CartKey, cartData: RequestCart ) =>
	wp.req.post( `/me/shopping-cart/${ cartKey }`, cartData );

export const cartManagerClient = createShoppingCartManagerClient( {
	getCart: wpcomGetCart,
	setCart: wpcomSetCart,
} );
