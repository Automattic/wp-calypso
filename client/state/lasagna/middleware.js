/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { getCurrentUser } from 'state/current-user/selectors';
import { SOCKET, connectSocket, disconnectSocket } from './socket';
import userChannelMiddleware from './user-channel/actions-to-events';
import siteChannelMiddleware from './site-channel/actions-to-events';

/**
 * Compose a list of middleware into one middleware
 * Props @rhc3
 *
 * @param m middlewares to compose
 */
const combineMiddleware = ( ...m ) => {
	return store => {
		const initialized = m.map( middleware => middleware( store ) );
		return next => initialized.reduce( ( chain, mw ) => mw( chain ), next );
	};
};

/**
 * Connection management middleware
 *
 * @param store middleware store
 */
const connectMiddleware = store => next => action => {
	// bail unless this is a section set with the section definition
	if ( action.type !== 'SECTION_SET' || ! action.section ) {
		return next( action );
	}

	// connect if we are going to the reader without a socket
	if ( SOCKET.status === 'init' && action.section.name === 'reader' ) {
		const user = getCurrentUser( store.getState() );

		wpcom
			.request( {
				method: 'POST',
				path: '/jwt/sign',
				body: { payload: JSON.stringify( { user } ) },
			} )
			.then( ( { jwt } ) => {
				connectSocket( { store, jwt, userId: user.ID } );
			} );
	}

	// disconnect if we are leaving the reader with a socket
	else if ( SOCKET.status !== 'init' && action.section.name !== 'reader' ) {
		disconnectSocket( { store } );
	}

	return next( action );
};

export default combineMiddleware( connectMiddleware, userChannelMiddleware, siteChannelMiddleware );
