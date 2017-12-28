/**
 * @format
 */

/**
 * Internal dependencies
 */
import {
	READER_CONVERSATION_FOLLOW,
	READER_CONVERSATION_MUTE,
	READER_CONVERSATION_UPDATE_FOLLOW_STATUS,
} from 'client/state/action-types';

export function followConversation( { siteId, postId } ) {
	return {
		type: READER_CONVERSATION_FOLLOW,
		payload: {
			siteId,
			postId,
		},
	};
}

export function muteConversation( { siteId, postId } ) {
	return {
		type: READER_CONVERSATION_MUTE,
		payload: {
			siteId,
			postId,
		},
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
