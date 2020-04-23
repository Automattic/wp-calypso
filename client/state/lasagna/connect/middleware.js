/**
 * Internal dependencies
 */
import { ROUTE_SET } from 'state/action-types';
import { socketConnect, socketDisconnect } from '../socket';
import { lasagna } from '../middleware';

let socketConnecting = false;

export default ( store ) => ( next ) => async ( action ) => {
	switch ( action.type ) {
		case ROUTE_SET: {
			// we match the ROUTE_SET path because SECTION_SET can fire all over
			// the place on hard loads of full post views and conversations
			const readerPathRegex = new RegExp( '^/read$|^/read/' );

			// connect if we are going to the reader without a socket
			if ( ! lasagna.isConnected() && ! socketConnecting && readerPathRegex.test( action.path ) ) {
				socketConnecting = true;
				await socketConnect( store );
				socketConnecting = false;
			}

			// disconnect if we are leaving the reader with a socket
			else if ( lasagna.isConnected() && ! readerPathRegex.test( action.path ) ) {
				socketDisconnect( store );
			}
			break;
		}
	}

	return next( action );
};
