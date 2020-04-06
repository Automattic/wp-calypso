/**
 * Internal Dependencies
 */
import registerEventHandlers from './events-to-actions';
import { channelJoin, channelLeave } from 'state/lasagna/socket';
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

		case READER_VIEW_FEED_POST_SET:
		case READER_VIEW_FULL_POST_SET: {
			const topic = getChannelTopic( action );
			if ( ! topic ) {
				return next( action );
			}

			const { siteId, postId } = action.payload;
			const meta = { siteId, postId };

			leaveStaleChannels( store, namespace );

			if ( canJoinChannel( store, topic ) ) {
				channelJoin( { store, namespace, topic, registerEventHandlers, meta } );
			}
			break;
		}

		case READER_VIEW_FULL_POST_UNSET:
		case READER_VIEW_FEED_POST_UNSET: {
			const topic = getChannelTopic( action );
			if ( ! topic ) {
				return next( action );
			}

			if ( canLeaveChannel( store, topic ) ) {
				channelLeave( { store, namespace, topic } );
			}
			break;
		}
	}

	return next( action );
};
