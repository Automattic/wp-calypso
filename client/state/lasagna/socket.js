import createDebug from 'debug';
import { getCurrentUserLasagnaJwt } from 'calypso/state/current-user/selectors';
import { socketConnected, socketDisconnected } from 'calypso/state/lasagna/actions';
import { lasagna } from './middleware';

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
