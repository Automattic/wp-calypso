/**
 * External Dependencies
 */
import createDebug from 'debug';

/**
 * Internal dependencies
 */
import config from 'config';
import { socketConnected, socketDisconnected } from 'state/lasagna/actions';
import { socketClosed, socketConnectError } from './actions';
import { resetChannels } from 'state/lasagna/channel';

/**
 * Module vars
 */
const debug = createDebug( 'lasagna:socket' );
const url = config( 'lasagna_url' );
export const SOCKET = {
	status: 'init',
	ref: null,
};

// Expose socket in development
if ( process.env.NODE_ENV === 'development' ) {
	window.SOCKET = SOCKET;
}

export function connectSocket( { store, jwt, userId } ) {
	if ( SOCKET.status !== 'init' ) {
		return;
	}

	SOCKET.status = 'opening';
	debug( 'opening' );

	import( /* webpackChunkName: "phoenix" */ 'phoenix' ).then( ( { Socket } ) => {
		const socketInstance = new Socket( url, { params: { jwt, user_id: userId } } );
		SOCKET.ref = socketInstance;

		socketInstance.onOpen( () => {
			debug( 'opened' );
			SOCKET.status = 'opened';
			store.dispatch( socketConnected() );
		} );

		socketInstance.onClose( () => {
			debug( 'closed' );
			SOCKET.status = 'closed';
			store.dispatch( socketClosed() );
			// @TODO: verify this Phoenix.js state, dispatch attempting reconnect here?
		} );

		socketInstance.onError( () => {
			SOCKET.status = 'open_error';
			debug( 'connection error' );
			store.dispatch( socketConnectError() );
			// @TODO: verify this Phoenix.js state, dispatch attempting reconnect here?
		} );

		socketInstance.connect();
	} );
}

export function disconnectSocket( { store } ) {
	debug( 'disconnected' );
	SOCKET.ref && SOCKET.ref.disconnect();
	initSocket();
	resetChannels();
	store.dispatch( socketDisconnected() );
}

export function initSocket() {
	debug( 'init' );

	SOCKET.status = 'init';
	SOCKET.ref = null;
}
