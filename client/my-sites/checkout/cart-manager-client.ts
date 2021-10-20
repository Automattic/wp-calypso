import { createShoppingCartManagerClient } from '@automattic/shopping-cart';
import wp from 'calypso/lib/wp';
import type { RequestCart } from '@automattic/shopping-cart';
import type { LogToLogstashParams } from 'calypso/state/logstash/actions';

const logToLogstash = ( params: LogToLogstashParams ) =>
	wp.req.post( {
		method: 'POST',
		apiVersion: '1.1',
		path: '/logstash',
		body: { params: JSON.stringify( params ) },
	} );

const wpcomGetCart = ( cartKey: string ) => {
	// Trying to gather information to track down backend errors where a user
	// tries to fetch the cart of a site they don't own.
	logToLogstash( {
		feature: 'calypso_client',
		message: 'Fetching cart from calypso',
		extra: {
			cartKey,
			url: window.location.href,
		},
	} );
	return wp.req.get( `/me/shopping-cart/${ cartKey }` );
};
const wpcomSetCart = ( cartKey: string, cartData: RequestCart ) =>
	wp.req.post( `/me/shopping-cart/${ cartKey }`, cartData );

export const cartManagerClient = createShoppingCartManagerClient( {
	getCart: wpcomGetCart,
	setCart: wpcomSetCart,
} );
