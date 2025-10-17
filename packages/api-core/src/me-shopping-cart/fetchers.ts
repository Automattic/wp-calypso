import { wpcom } from '../wpcom-fetcher';
import type { CartKey } from '@automattic/shopping-cart';

export const fetchShoppingCart = ( cartKey: CartKey ) =>
	wpcom.req.get( `/me/shopping-cart/${ cartKey }` );
