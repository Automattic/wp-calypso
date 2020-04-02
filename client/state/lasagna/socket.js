/**
 * External Dependencies
 */
import { Socket } from 'phoenix';
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

export function socketConnect( store, jwt, userId ) {
	if ( socket !== null ) {
		return;
	}

	socket = new Socket( url, { params: { jwt, user_id: userId } } );

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
}

export function socketDisconnect( store ) {
	socket && socket.disconnect();
	socket = null;
	store.dispatch( socketDisconnected() );
}
