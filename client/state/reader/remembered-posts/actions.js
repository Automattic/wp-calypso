/**
 * @format
 */

/**
 * Internal dependencies
 */
import {
	READER_REMEMBERED_POSTS_REMEMBER,
	READER_REMEMBERED_POSTS_FORGET,
	READER_REMEMBERED_POSTS_UPDATE_STATUS,
} from 'state/action-types';

export function rememberPost( { siteId, postId } ) {
	return {
		type: READER_REMEMBERED_POSTS_REMEMBER,
		payload: {
			siteId,
			postId,
		},
	};
}

export function forgetPost( { siteId, postId } ) {
	return {
		type: READER_REMEMBERED_POSTS_FORGET,
		payload: {
			siteId,
			postId,
		},
	};
}

export function updateRememberedPostStatus( { siteId, postId, status } ) {
	return {
		type: READER_REMEMBERED_POSTS_UPDATE_STATUS,
		payload: {
			siteId,
			postId,
			status,
		},
	};
}
