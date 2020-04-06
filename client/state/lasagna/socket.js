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
export let SOCKET = null;

export function connectSocket( { store, jwt, userId } ) {
	if ( SOCKET !== null ) {
		return;
	}

	import( 'phoenix' ).then( ( { Socket } ) => {
		SOCKET = new Socket( url, { params: { jwt, user_id: userId } } );

		// Expose socket in development
		if ( process.env.NODE_ENV === 'development' ) {
			window.SOCKET = SOCKET;
		}

		SOCKET.onOpen( () => {
			debug( 'opened' );
			store.dispatch( socketConnected() );
		} );

		SOCKET.onClose( () => {
			debug( 'closed' );
			store.dispatch( socketClosed() );
			// @TODO: verify this Phoenix.js state, dispatch attempting reconnect here?
		} );

		SOCKET.onError( () => {
			debug( 'connection error' );
			store.dispatch( socketConnectError() );
			// @TODO: verify this Phoenix.js state, dispatch attempting reconnect here?
		} );

		SOCKET.connect();
	} );
}

export function disconnectSocket( { store } ) {
	debug( 'disconnected' );
	SOCKET && SOCKET.disconnect();
	resetSocket();
	resetChannels();
	store.dispatch( socketDisconnected() );
}

export function resetSocket() {
	debug( 'reset' );
	SOCKET = null;
}
