import wpcom from 'calypso/lib/wp';
import type { RequestCart, CartKey } from '@automattic/shopping-cart'; // eslint-disable-line

export const wpcomGetCart = ( cartKey: CartKey ) =>
	wpcom.req.get( `/me/shopping-cart/${ cartKey }` );

export const wpcomSetCart = ( cartKey: CartKey, cartData: RequestCart ) =>
	wpcom.req.post( `/me/shopping-cart/${ cartKey }`, cartData );
