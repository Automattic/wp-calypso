/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal Dependencies
 */
import { lasagna } from '../middleware';
import { LASAGNA_SOCKET_CONNECTED } from 'calypso/state/action-types';
import { getCurrentUserId, getCurrentUserLasagnaJwt } from 'calypso/state/current-user/selectors';

const channelTopicPrefix = 'push:wordpress.com:user:';
const debug = debugFactory( 'lasagna:channel' );

const joinChannel = async ( store, topic ) => {
	await lasagna.initChannel(
		topic,
		{ content_type: 'user', jwt: getCurrentUserLasagnaJwt( store.getState() ) },
		{
			onClose: () => debug( topic + ' channel closed' ),
			onError: ( reason ) => debug( topic + ' channel error', reason ),
		}
	);

	// registerEventHandlers here

	lasagna.joinChannel( topic, () => debug( topic + ' channel join ok' ) );
};

/**
 * Middleware
 *
 * @param store middleware store
 */
export default ( store ) => ( next ) => ( action ) => {
	const mwResult = next( action );
	const userId = getCurrentUserId( store.getState() );

	if ( ! userId ) {
		return mwResult;
	}

	const topic = channelTopicPrefix + userId;

	switch ( action.type ) {
		case LASAGNA_SOCKET_CONNECTED: {
			joinChannel( store, topic );
			break;
		}
	}

	return mwResult;
};
