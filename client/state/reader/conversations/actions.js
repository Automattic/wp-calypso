/**
 * @format
 */

/**
 * Internal dependencies
 */
import {
	READER_CONVERSATION_FOLLOW,
	READER_CONVERSATION_UPDATE_FOLLOW_STATUS,
} from 'state/action-types';

export function followConversation( { blogId, postId } ) {
	return {
		type: READER_CONVERSATION_FOLLOW,
		payload: {
			blogId,
			postId,
		},
	};
}

export function updateConversationFollowStatus( { blogId, postId, followStatus } ) {
	return {
		type: READER_CONVERSATION_UPDATE_FOLLOW_STATUS,
		payload: {
			blogId,
			postId,
			followStatus,
		},
	};
}
