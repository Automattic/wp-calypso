/**
 * Internal Dependencies
 */
import registerEventHandlers from './events-to-actions';
import { joinChannel, leaveChannel } from 'state/lasagna/channel';
import { LASAGNA_SOCKET_CONNECTED } from 'state/lasagna/action-types';
import { getViewingFullPostSiteId } from 'state/reader/viewing/selectors';
import {
	READER_VIEW_FULL_POST_SET,
	READER_VIEW_FULL_POST_UNSET,
	READER_VIEW_FEED_POST_SET,
	READER_VIEW_FEED_POST_UNSET,
	READER_STREAMS_UPDATES_RECEIVE,
} from 'state/reader/action-types';
import {
	canJoinChannel,
	leaveStaleChannels,
	getChannelTopic,
	canLeaveChannel,
	namespace,
} from './manager';

export default store => next => action => {
	switch ( action.type ) {
		case READER_STREAMS_UPDATES_RECEIVE:
			// whenever we poll for updates leave stale channels
			leaveStaleChannels( store, namespace );
			break;

		case LASAGNA_SOCKET_CONNECTED: {
			// whenever socket is connected check if we should join the full-post channel, this covers the edge case
			// when a user force refreshes the full post view and it might try to join the channel before the socket is
			// connected.
			const state = store.getState();
			const siteId = getViewingFullPostSiteId( state );
			const topic = getChannelTopic( { payload: { siteId } } );
			const meta = { siteId };

			joinChannel( { store, namespace, topic, registerEventHandlers, meta } );
			break;
		}

		case READER_VIEW_FEED_POST_SET:
		case READER_VIEW_FULL_POST_SET: {
			// a full post or feed post is viewed, we will join their site channels
			const topic = getChannelTopic( action );
			if ( ! topic ) {
				return next( action );
			}

			const { siteId, postId } = action.payload;
			const meta = { siteId, postId };

			leaveStaleChannels( store, namespace );

			if ( canJoinChannel( store, topic ) ) {
				joinChannel( { store, namespace, topic, registerEventHandlers, meta } );
			}
			break;
		}

		case READER_VIEW_FULL_POST_UNSET:
		case READER_VIEW_FEED_POST_UNSET: {
			// a full post or feed post is not viewed, we will leave the channel
			const topic = getChannelTopic( action );
			if ( ! topic ) {
				return next( action );
			}

			if ( canLeaveChannel( store, topic ) ) {
				leaveChannel( { store, namespace, topic } );
			}
			break;
		}
	}

	return next( action );
};
