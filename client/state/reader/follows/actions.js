import {
	READER_FOLLOW,
	READER_FOLLOW_ERROR,
	READER_UNFOLLOW,
	READER_FOLLOWS_RECEIVE,
	READER_FOLLOWS_SYNC_START,
	READER_FOLLOWS_SYNC_COMPLETE,
	READER_SUBSCRIBE_TO_NEW_POST_EMAIL,
	READER_UNSUBSCRIBE_TO_NEW_POST_EMAIL,
	READER_SUBSCRIBE_TO_NEW_COMMENT_EMAIL,
	READER_UNSUBSCRIBE_TO_NEW_COMMENT_EMAIL,
	READER_UPDATE_NEW_POST_EMAIL_SUBSCRIPTION,
	READER_SUBSCRIBE_TO_NEW_POST_NOTIFICATIONS,
	READER_UNSUBSCRIBE_TO_NEW_POST_NOTIFICATIONS,
} from 'calypso/state/reader/action-types';

import 'calypso/state/data-layer/wpcom/read/following/mine';
import 'calypso/state/data-layer/wpcom/read/following/mine/delete';
import 'calypso/state/data-layer/wpcom/read/following/mine/new';
import 'calypso/state/data-layer/wpcom/read/site/comment-email-subscriptions/delete';
import 'calypso/state/data-layer/wpcom/read/site/comment-email-subscriptions/new';
import 'calypso/state/data-layer/wpcom/read/site/post-email-subscriptions/delete';
import 'calypso/state/data-layer/wpcom/read/site/post-email-subscriptions/new';
import 'calypso/state/data-layer/wpcom/read/site/post-email-subscriptions/update';
import 'calypso/state/data-layer/wpcom/read/sites/notification-subscriptions/delete';
import 'calypso/state/data-layer/wpcom/read/sites/notification-subscriptions/new';

import 'calypso/state/reader/init';

/**
 * Extended information about a reader follow
 *
 * @typedef {Object} follow
 * @property {number} ID
 * @property {string} URL The URL being followed. Usually a feed.
 * @property {string} feed_URL Same as URL
 * @property {number} blog_ID The blog ID. Optional.
 * @property {number} feed_ID The feed ID
 * @property {number} date_subscribed The date subscribed. Seconds since epoch.
 * @property {boolean} is_owner Is the current user the owner of this site
 * @property {Object} delivery_methods
 */

/**
 * Follow a feed URL
 *
 * @param  {string} feedUrl      The feed URL
 * @param {Object} followInfo		A subscription, optional
 * @returns {Object}              The action
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
 * @param  {string} feedUrl Feed URL
 * @param  {Object} error Error response (contains keys 'info' and 'subscribed')
 * @returns {Object} Action
 */
export function recordFollowError( feedUrl, error ) {
	const action = {
		type: READER_FOLLOW_ERROR,
		payload: { feedUrl, error },
	};

	return action;
}

export function receiveFollows( { follows, totalCount } ) {
	return {
		type: READER_FOLLOWS_RECEIVE,
		payload: { follows, totalCount },
	};
}

/**
 * Returns an action object to signal that follows have been requested.
 *
 * @returns {Object} 		Action object
 */
export function requestFollows() {
	return {
		type: READER_FOLLOWS_SYNC_START,
	};
}

/**
 * Represents a completed sync.
 *
 * @param  {Array} followedUrls An array of all the feed URLS seen during the sync
 * @returns {Object}              The action
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

export function subscribeToNewPostNotifications( blogId ) {
	return {
		type: READER_SUBSCRIBE_TO_NEW_POST_NOTIFICATIONS,
		payload: {
			blogId,
		},
	};
}

export function unsubscribeToNewPostNotifications( blogId ) {
	return {
		type: READER_UNSUBSCRIBE_TO_NEW_POST_NOTIFICATIONS,
		payload: {
			blogId,
		},
	};
}
