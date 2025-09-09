import { wpcom } from '../wpcom-fetcher';
import type { CartKey, RequestCart } from '@automattic/shopping-cart';

export const updateShoppingCart = ( cartKey: CartKey, cartData: RequestCart ) =>
	wpcom.req.post( `/me/shopping-cart/${ cartKey }`, cartData );
