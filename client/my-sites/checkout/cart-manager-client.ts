/**
 * External dependencies
 */
import { createShoppingCartManagerClient } from '@automattic/shopping-cart';
import type { RequestCart } from '@automattic/shopping-cart';

/**
 * Internal Dependencies
 */
import wp from 'calypso/lib/wp';

const wpcomGetCart = ( cartKey: string ) => wp.req.get( `/me/shopping-cart/${ cartKey }` );
const wpcomSetCart = ( cartKey: string, cartData: RequestCart ) =>
	wp.req.post( `/me/shopping-cart/${ cartKey }`, cartData );

export const cartManagerClient = createShoppingCartManagerClient( {
	getCart: wpcomGetCart,
	setCart: wpcomSetCart,
} );
