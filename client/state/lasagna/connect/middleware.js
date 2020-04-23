/**
 * Internal dependencies
 */
import { SECTION_SET } from 'state/action-types';
import { socketConnect, socketDisconnect } from '../socket';
import { lasagna } from '../middleware';

// gating madness, both necessary to prevent SECTION_SET race conditions
let socketConnected = false;
let socketConnecting = false;

export default ( store ) => ( next ) => async ( action ) => {
	switch ( action.type ) {
		case SECTION_SET: {
			const { section } = action;

			// connect if we are in the reader without a socket
			if ( section && section.name === 'reader' && ! socketConnected && ! socketConnecting ) {
				socketConnecting = true;
				await socketConnect( store );
				socketConnecting = false;
				socketConnected = true;
			}

			// disconnect if we are leaving the reader with a socket
			else if ( section && section.name && section.name !== 'reader' && lasagna.isConnected() ) {
				socketDisconnect( store );
				socketConnected = false;
			}
			break;
		}
	}

	return next( action );
};
