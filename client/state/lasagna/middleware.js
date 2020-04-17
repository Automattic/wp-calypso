/**
 * Internal dependencies
 */
import { getCurrentUserLasagnaJwt } from 'state/current-user/selectors';
import { socket, socketConnect, socketDisconnect } from './socket';
import privatePostChannelMiddleware from './private-post-channel/actions-to-events';
import publicPostChannelMiddleware from './public-post-channel/actions-to-events';
import userChannelMiddleware from './user-channel/actions-to-events';

let socketConnecting = false;

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
	// bail unless this is a route set
	if ( action.type !== 'ROUTE_SET' ) {
		return next( action );
	}

	// we match the ROUTE_SET path because SECTION_SET can fire all over
	// the place on hard loads of full post views and conversations
	const readerPathRegex = new RegExp( '^/read$|^/read/' );

	// connect if we are going to the reader without a socket
	if ( ! socket && ! socketConnecting && readerPathRegex.test( action.path ) ) {
		socketConnecting = true;
		socketConnect( store, getCurrentUserLasagnaJwt( store.getState() ) );
		socketConnecting = false;
	}

	// disconnect if we are leaving the reader with a socket
	else if ( socket && ! readerPathRegex.test( action.path ) ) {
		socketDisconnect( store );
	}

	return next( action );
};

export default combineMiddleware(
	connectMiddleware,
	userChannelMiddleware,
	privatePostChannelMiddleware,
	publicPostChannelMiddleware
);
