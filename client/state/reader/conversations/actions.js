/**
 */

/**
 * Internal dependencies
 */
import {
	READER_CONVERSATION_FOLLOW,
	READER_CONVERSATION_MUTE,
	READER_CONVERSATION_UPDATE_FOLLOW_STATUS,
} from 'state/action-types';
import getReaderConversationFollowStatus from 'state/selectors/get-reader-conversation-follow-status';

import 'state/data-layer/wpcom/read/sites/posts/follow';
import 'state/data-layer/wpcom/read/sites/posts/mute';

export function followConversation( { siteId, postId } ) {
	return ( dispatch, getState ) => {
		dispatch( {
			type: READER_CONVERSATION_FOLLOW,
			payload: {
				siteId,
				postId,
			},
			meta: {
				previousState: getReaderConversationFollowStatus( getState(), {
					siteId,
					postId,
				} ),
			},
		} );
	};
}
export function muteConversation( { siteId, postId } ) {
	return ( dispatch, getState ) => {
		dispatch( {
			type: READER_CONVERSATION_MUTE,
			payload: {
				siteId,
				postId,
			},
			meta: {
				previousState: getReaderConversationFollowStatus( getState(), {
					siteId,
					postId,
				} ),
			},
		} );
	};
}

export function updateConversationFollowStatus( { siteId, postId, followStatus } ) {
	return {
		type: READER_CONVERSATION_UPDATE_FOLLOW_STATUS,
		payload: {
			siteId,
			postId,
			followStatus,
		},
	};
}
