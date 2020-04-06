/**
 * Internal Dependencies
 */
import { LASAGNA_SOCKET_CONNECTED, LASAGNA_SOCKET_DISCONNECTED } from 'state/lasagna/action-types';
import { getCurrentUserId } from 'state/current-user/selectors';
import { joinChannel, leaveChannel } from 'state/lasagna/channel';
import { namespace, canJoinChannel, canLeaveChannel, getChannelTopic } from './manager';

export default store => next => action => {
	switch ( action.type ) {
		case LASAGNA_SOCKET_CONNECTED: {
			const state = store.getState();
			const userId = getCurrentUserId( state );
			const topic = getChannelTopic( userId );

			if ( canJoinChannel( store, topic ) ) {
				joinChannel( { store, namespace, topic } );
			}

			break;
		}

		case LASAGNA_SOCKET_DISCONNECTED: {
			const state = store.getState();
			const userId = getCurrentUserId( state );
			const topic = getChannelTopic( userId );

			if ( canLeaveChannel( store, topic ) ) {
				leaveChannel( { store, namespace, topic } );
			}
			break;
		}
	}

	return next( action );
};
