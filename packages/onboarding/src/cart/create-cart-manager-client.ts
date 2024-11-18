import { createShoppingCartManagerClient } from '@automattic/shopping-cart';
import wpcomRequest from 'wpcom-proxy-request';
import type {
	RequestCart,
	CartKey,
	ResponseCart,
	ResponseCartProduct,
} from '@automattic/shopping-cart';

const wpcomGetCart = ( cartKey: CartKey ) => {
	let source;
	try {
		source = window?.location?.pathname;
	} catch {
		// Ignore failures here if window is not present.
	}
	return wpcomRequest< ResponseCart< ResponseCartProduct > >( {
		path: `/me/shopping-cart/${ cartKey }?source=${ source ?? 'unknown' }`,
		method: 'GET',
		apiVersion: '1.1',
	} );
};
const wpcomSetCart = ( cartKey: CartKey, cartData: RequestCart ) =>
	wpcomRequest< ResponseCart< ResponseCartProduct > >( {
		path: `/me/shopping-cart/${ cartKey }`,
		apiVersion: '1.1',
		method: 'POST',
		body: cartData,
	} );

export default createShoppingCartManagerClient( {
	getCart: wpcomGetCart,
	setCart: wpcomSetCart,
} );
