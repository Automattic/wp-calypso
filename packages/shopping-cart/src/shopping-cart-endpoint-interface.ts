import wpcomRequest from 'wpcom-proxy-request';
import { GetCart, SetCart } from './types';

export const getCart: GetCart = ( cartKey ) => {
	return wpcomRequest( {
		path: `/me/shopping-cart/${ cartKey }`,
		apiVersion: '1.1',
	} );
};

export const setCart: SetCart = ( cartKey, cartData ) => {
	return wpcomRequest( {
		path: `/me/shopping-cart/${ cartKey }`,
		apiVersion: '1.1',
		method: 'POST',
		body: cartData,
	} );
};
