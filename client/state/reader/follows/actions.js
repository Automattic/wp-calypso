/**
 * External dependencies
 */
import debugModule from 'debug';

/**
 * Internal dependencies
 */
import {
	READER_FOLLOW,
	READER_UNFOLLOW,
	READER_FOLLOWS_RECEIVE,
	READER_FOLLOWS_SYNC_START,
	READER_SUBSCRIBE_TO_NEW_POST_EMAIL,
	READER_UNSUBSCRIBE_TO_NEW_POST_EMAIL,
	READER_SUBSCRIBE_TO_NEW_COMMENT_EMAIL,
	READER_UNSUBSCRIBE_TO_NEW_COMMENT_EMAIL,
	READER_UPDATE_NEW_POST_EMAIL_SUBSCRIPTION,
} from 'state/action-types';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:redux:reader-follows' );

/**
 * Returns an action object to signal that a URL has been followed.
 *
 * @param  {String} url Followed URL
 * @return {Function} Action thunk
 */
export function recordFollow( url ) {
	return ( dispatch ) => {
		debug( 'User followed ' + url );
		dispatch( {
			type: READER_FOLLOW,
			payload: { url }
		} );
	};
}

/**
 * Returns an action object to signal that a URL has been unfollowed.
 *
 * @param  {String} url Unfollowed URL
 * @return {Function} Action thunk
 */
export function recordUnfollow( url ) {
	return ( dispatch ) => {
		debug( 'User unfollowed ' + url );
		dispatch( {
			type: READER_UNFOLLOW,
			payload: { url }
		} );
	};
}

/**
 * Returns an action object to signal that followed sites have been received.
 *
 * @param  {Array}  follows Follows received
 * @return {Object} 		Action object
 */
export function receiveFollows( follows ) {
	return {
		type: READER_FOLLOWS_RECEIVE,
		payload: { follows }
	};
}

/**
 * Returns an action object to signal that follows have been requested.
 *
 * @return {Object} 		Action object
 */
export function requestFollows() {
	return {
		type: READER_FOLLOWS_SYNC_START,
	};
}

export function subscribeToNewPostEmail( blogId ) {
	return {
		type: READER_SUBSCRIBE_TO_NEW_POST_EMAIL,
		payload: {
			blogId
		}
	};
}

export function unsubscribeToNewPostEmail( blogId ) {
	return {
		type: READER_UNSUBSCRIBE_TO_NEW_POST_EMAIL,
		payload: {
			blogId
		}
	};
}

export function updateNewPostEmailSubscription( blogId, deliveryFrequency ) {
	return {
		type: READER_UPDATE_NEW_POST_EMAIL_SUBSCRIPTION,
		payload: {
			blogId,
			deliveryFrequency
		}
	};
}

export function subscribeToNewCommentEmail( blogId ) {
	return {
		type: READER_SUBSCRIBE_TO_NEW_COMMENT_EMAIL,
		payload: {
			blogId
		}
	};
}

export function unsubscribeToNewCommentEmail( blogId ) {
	return {
		type: READER_UNSUBSCRIBE_TO_NEW_COMMENT_EMAIL,
		payload: {
			blogId
		}
	};
}
