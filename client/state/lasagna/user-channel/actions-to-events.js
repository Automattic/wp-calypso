/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal Dependencies
 */
import { lasagna } from '../middleware';
import { LASAGNA_SOCKET_CONNECTED, LASAGNA_SOCKET_DISCONNECTED } from 'state/action-types';
import { getCurrentUserId, getCurrentUserLasagnaJwt } from 'state/current-user/selectors';

const debug = debugFactory( 'lasagna:channel:push:wordpress.com:user' );

const joinChannel = ( store, topic ) => {
	lasagna.initChannel(
		topic,
		{ jwt: getCurrentUserLasagnaJwt( store.getState() ) },
		{
			onClose: () => debug( 'channel closed' ),
			onError: ( reason ) => debug( 'channel error', reason ),
		}
	);

	// registerEventHandlers here

	lasagna.joinChannel( topic, () => debug( 'channel join ok' ) );
};

const leaveChannel = ( topic ) => {
	lasagna.leaveChannel( topic );
};

export default ( store ) => ( next ) => ( action ) => {
	const userId = getCurrentUserId( store.getState() );

	if ( ! userId ) {
		return next( action );
	}

	const topic = `push:wordpress.com:user:${ userId }`;

	switch ( action.type ) {
		case LASAGNA_SOCKET_CONNECTED: {
			joinChannel( store, topic );
			break;
		}

		case LASAGNA_SOCKET_DISCONNECTED:
			leaveChannel( topic );
			break;
	}

	return next( action );
};
