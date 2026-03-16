import { createShoppingCartManagerClient } from '@automattic/shopping-cart';
import { wpcom } from '../wpcom-request';
import type {
	RequestCart,
	CartKey,
	ResponseCart,
	ResponseCartProduct,
} from '@automattic/shopping-cart';

const wpcomGetCart = ( cartKey: CartKey ): Promise< ResponseCart< ResponseCartProduct > > => {
	let source;
	try {
		source = window?.location?.pathname;
	} catch {
		// Ignore failures here if window is not present.
	}
	return wpcom.req.get( {
		path: `/me/shopping-cart/${ cartKey }?source=${ source ?? 'unknown' }`,
		apiVersion: '1.1',
	} );
};
const wpcomSetCart = (
	cartKey: CartKey,
	cartData: RequestCart
): Promise< ResponseCart< ResponseCartProduct > > =>
	wpcom.req.post( {
		path: `/me/shopping-cart/${ cartKey }`,
		apiVersion: '1.1',
		body: cartData,
	} );

export default createShoppingCartManagerClient( {
	getCart: wpcomGetCart,
	setCart: wpcomSetCart,
} );
