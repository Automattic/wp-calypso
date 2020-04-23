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
			onClose: () => {
				debug( 'socket closed' );
				store.dispatch( socketDisconnected() );
			},
			onError: () => {
				debug( 'socket error' );
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
