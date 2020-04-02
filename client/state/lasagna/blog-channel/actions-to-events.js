/**
 * Internal Dependencies
 */
import registerEventHandlers from './events-to-actions';
import { channelJoin, channelLeave } from 'state/lasagna/socket';
import {
	READER_STREAMS_VIEW_ITEM,
	READER_STREAMS_UNVIEW_ITEM,
	READER_STREAMS_UPDATES_RECEIVE,
	READER_POST_SEEN,
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

		case READER_POST_SEEN:
		case READER_STREAMS_VIEW_ITEM: {
			const topic = getChannelTopic( action );
			if ( ! topic ) {
				return next( action );
			}
			const meta = { blogId: action.payload.post.site_ID, postId: action.payload.post.ID };
			leaveStaleChannels( store, namespace );

			if ( canJoinChannel( store, topic ) ) {
				channelJoin( { store, namespace, topic, registerEventHandlers, meta } );
			}
			break;
		}

		case READER_STREAMS_UNVIEW_ITEM: {
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
