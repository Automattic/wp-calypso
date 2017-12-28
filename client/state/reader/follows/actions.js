/** @format */
/**
 * External dependencies
 */
import debugModule from 'debug';

/**
 * Internal dependencies
 */
import {
	READER_FOLLOW,
	READER_FOLLOW_ERROR,
	READER_UNFOLLOW,
	READER_RECORD_FOLLOW,
	READER_RECORD_UNFOLLOW,
	READER_FOLLOWS_RECEIVE,
	READER_FOLLOWS_SYNC_START,
	READER_FOLLOWS_SYNC_COMPLETE,
	READER_SUBSCRIBE_TO_NEW_POST_EMAIL,
	READER_UNSUBSCRIBE_TO_NEW_POST_EMAIL,
	READER_SUBSCRIBE_TO_NEW_COMMENT_EMAIL,
	READER_UNSUBSCRIBE_TO_NEW_COMMENT_EMAIL,
	READER_UPDATE_NEW_POST_EMAIL_SUBSCRIPTION,
} from 'client/state/action-types';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:redux:reader-follows' );

/**
 * Extended information about a reader follow
 * @typedef {Object} follow
 * @property {number} ID
 * @property {string} URL The URL being followed. Usually a feed.
 * @property {string} feed_URL Same as URL
 * @property {number} blog_ID The blog ID. Optional.
 * @property {number} feed_ID The feed ID
 * @property {number} date_subscribed The date subscribed. Seconds since epoch.
 * @property {boolean} is_owner Is the current user the owner of this site
 * @property {Object} delivery_methods
 *
 */

/**
 * Follow a feed URL
 * @param  {string} feedUrl      The feed URL
 * @param {Follow} followInfo		A subscription, optional
 * @return {Object}              The action
 */
export function follow( feedUrl, followInfo ) {
	const action = {
		type: READER_FOLLOW,
		payload: { feedUrl },
	};
	if ( followInfo ) {
		action.payload.follow = followInfo;
	}
	return action;
}

export function unfollow( feedUrl ) {
	return {
		type: READER_UNFOLLOW,
		payload: { feedUrl },
	};
}

/**
 * Returns an action object to signal that an error was encountered
 * when following a URL.
 *
 * @param  {String} feedUrl Feed URL
 * @param  {Object} response Error response (contains keys 'info' and 'subscribed')
 * @return {Object} Action
 */
export function recordFollowError( feedUrl, error ) {
	const action = {
		type: READER_FOLLOW_ERROR,
		payload: { feedUrl, error },
	};

	return action;
}

/**
 * Returns an action object to signal that a URL has been followed.
 *
 * @param  {String} url Followed URL
 * @return {Function} Action thunk
 */
export function recordFollow( url ) {
	return dispatch => {
		debug( 'User followed ' + url );
		dispatch( {
			type: READER_RECORD_FOLLOW,
			payload: { url },
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
	return dispatch => {
		debug( 'User unfollowed ' + url );
		dispatch( {
			type: READER_RECORD_UNFOLLOW,
			payload: { url },
		} );
	};
}

/**
 * Returns an action object to signal that followed sites have been received.
 *
 * @param  {Array}  follows Follows received
 * @return {Object} 		Action object
 */
export function receiveFollows( { follows, totalCount } ) {
	return {
		type: READER_FOLLOWS_RECEIVE,
		payload: { follows, totalCount },
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

/**
 * Represents a completed sync.
 * @param  {Array} followedUrls An array of all the feed URLS seen during the sync
 * @return {Object}              The action
 */
export function syncComplete( followedUrls ) {
	return {
		type: READER_FOLLOWS_SYNC_COMPLETE,
		payload: followedUrls,
	};
}

export function subscribeToNewPostEmail( blogId ) {
	return {
		type: READER_SUBSCRIBE_TO_NEW_POST_EMAIL,
		payload: {
			blogId,
		},
	};
}

export function unsubscribeToNewPostEmail( blogId ) {
	return {
		type: READER_UNSUBSCRIBE_TO_NEW_POST_EMAIL,
		payload: {
			blogId,
		},
	};
}

export function updateNewPostEmailSubscription( blogId, deliveryFrequency ) {
	return {
		type: READER_UPDATE_NEW_POST_EMAIL_SUBSCRIPTION,
		payload: {
			blogId,
			deliveryFrequency,
		},
	};
}

export function subscribeToNewCommentEmail( blogId ) {
	return {
		type: READER_SUBSCRIBE_TO_NEW_COMMENT_EMAIL,
		payload: {
			blogId,
		},
	};
}

export function unsubscribeToNewCommentEmail( blogId ) {
	return {
		type: READER_UNSUBSCRIBE_TO_NEW_COMMENT_EMAIL,
		payload: {
			blogId,
		},
	};
}
