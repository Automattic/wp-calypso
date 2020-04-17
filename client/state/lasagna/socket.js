/**
 * External Dependencies
 */
import createDebug from 'debug';

/**
 * Internal dependencies
 */
import config from 'config';
import { socketConnected, socketDisconnected } from 'state/lasagna/actions';

/**
 * Module vars
 */
export let socket = null;

const debug = createDebug( 'lasagna:socket' );
const url = config( 'lasagna_url' );

export const socketConnect = ( store, jwt ) => {
	if ( socket !== null || ! jwt ) {
		return;
	}

	import( /* webpackChunkName: "phoenix" */ 'phoenix' ).then( ( { Socket } ) => {
		socket = new Socket( url, { params: { jwt } } );

		socket.onOpen( () => {
			debug( 'socket opened' );
			store.dispatch( socketConnected() );
		} );

		socket.onClose( () => {
			debug( 'socket closed' );
			// @TODO: verify this Phoenix.js state, dispatch attempting reconnect here?
		} );

		socket.onError( () => {
			debug( 'socket error' );
			// @TODO: verify this Phoenix.js state, dispatch attempting reconnect here?
		} );

		socket.connect();
	} );
};

export const socketDisconnect = store => {
	socket && socket.disconnect();
	socket = null;
	store.dispatch( socketDisconnected() );
};
