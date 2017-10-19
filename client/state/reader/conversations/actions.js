/**
 * @format
 */

/**
 * Internal dependencies
 */
import { READER_CONVERSATION_FOLLOW, READER_CONVERSATION_UNFOLLOW } from 'state/action-types';

export function followConversation( blogId, postId ) {
	return {
		type: READER_CONVERSATION_FOLLOW,
		payload: {
			blogId,
			postId,
		},
	};
}

export function unfollowConversation( blogId, postId ) {
	return {
		type: READER_CONVERSATION_UNFOLLOW,
		payload: {
			blogId,
			postId,
		},
	};
}
