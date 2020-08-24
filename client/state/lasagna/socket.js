/**
 * External Dependencies
 */
import createDebug from 'debug';

/**
 * Internal dependencies
 */
import { lasagna } from './middleware';
import { getCurrentUserLasagnaJwt } from 'state/current-user/selectors';
import { socketConnected, socketDisconnected } from 'state/lasagna/actions';

const debug = createDebug( 'lasagna:socket' );

export const socketConnect = async ( store ) => {
	await lasagna.initSocket(
		{ jwt: getCurrentUserLasagnaJwt( store.getState() ) },
		{
			onOpen: () => {
				debug( 'socket opened' );
				store.dispatch( socketConnected() );
			},
			onClose: ( reason ) => {
				debug( 'socket closed', reason );
				store.dispatch( socketDisconnected() );
			},
			onError: ( reason ) => {
				debug( 'socket error', reason );
			},
		}
	);

	return lasagna.connect();
};

export const socketDisconnect = ( store ) => {
	lasagna.disconnect( () => {
		debug( 'socket disconnected' );
		store.dispatch( socketDisconnected() );
	} );
};
