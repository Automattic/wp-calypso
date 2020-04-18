/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal Dependencies
 */
import { LASAGNA_SOCKET_CONNECTED, LASAGNA_SOCKET_DISCONNECTED } from 'state/action-types';
import { getCurrentUserId, getCurrentUserLasagnaJwt } from 'state/current-user/selectors';
import { socket } from '../socket';

let channel = null;

const debug = debugFactory( 'lasagna:channel:user' );

const joinChannel = ( store ) => {
	if ( ! socket || channel ) {
		return;
	}

	const userId = getCurrentUserId( store.getState() );
	const jwt = getCurrentUserLasagnaJwt( store.getState() );

	if ( ! userId || ! jwt ) {
		return;
	}

	channel = socket.channel( `push:wordpress.com:user:${ userId }`, { jwt } );
	// registerEventHandlers here

	channel
		.join()
		.receive( 'ok', () => debug( 'channel join ok' ) )
		.receive( 'error', ( { reason } ) => {
			debug( 'channel join error', reason );
			channel.leave();
			channel = null;
		} );
};

const leaveChannel = () => {
	channel && channel.leave();
	channel = null;
};

export default ( store ) => ( next ) => ( action ) => {
	switch ( action.type ) {
		case LASAGNA_SOCKET_CONNECTED: {
			joinChannel( store );
			break;
		}

		case LASAGNA_SOCKET_DISCONNECTED:
			leaveChannel();
			break;
	}

	return next( action );
};
