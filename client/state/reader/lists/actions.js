import {
	READER_LIST__CREATE,
	READER_LIST__DELETE,
	READER_LIST__FOLLOW,
	READER_LIST__FOLLOW_RECEIVE,
	READER_LIST__ITEMS_REQUEST,
	READER_LIST__ITEMS_RECEIVE,
	READER_LIST__ITEM_DELETE_FEED,
	READER_LIST__ITEM_DELETE_SITE,
	READER_LIST__ITEM_DELETE_TAG,
	READER_LIST__REQUEST_TARGET_LIST,
	READER_LIST__RECEIVE_TARGET_LIST,
	READER_LIST__CREATE_SUCCESS,
	READER_LIST__CREATE_FAILURE,
	READER_LIST__UNFOLLOW,
	READER_LIST__UNFOLLOW_RECEIVE,
	READER_LIST__UPDATE,
	READER_LIST__UPDATE_SUCCESS,
	READER_LIST__UPDATE_FAILURE,
	READER_LIST__ITEM_ADD_FEED,
	READER_LIST__ITEM_ADD_FEED_RECEIVE,
	READER_LIST__ITEM_ADD_TAG,
	READER_LIST__ITEM_ADD_TAG_RECEIVE,
	READER_LIST__RECEIVE_CURRENT_USER_SUBSCRIBED_LISTS,
	READER_LIST__REQUEST_CURRENT_USER_SUBSCRIBED_LISTS,
	READER_USER__REQUEST_LISTS,
} from 'calypso/state/reader/action-types';
import 'calypso/state/data-layer/wpcom/read/lists';
import 'calypso/state/data-layer/wpcom/read/lists/delete';
import 'calypso/state/data-layer/wpcom/read/lists/items';
import 'calypso/state/data-layer/wpcom/read/lists/feeds/delete';
import 'calypso/state/data-layer/wpcom/read/lists/sites/delete';
import 'calypso/state/data-layer/wpcom/read/lists/tags/delete';
import 'calypso/state/data-layer/wpcom/read/lists/tags/new';
import 'calypso/state/data-layer/wpcom/read/lists/feeds/new';
import 'calypso/state/reader/init';

/**
 * Returns an action object to signal that list objects have been received.
 * @param  {Array}  lists Lists received
 * @returns {Object}       Action object
 */
export function receiveCurrentUserSubscribedLists( lists ) {
	return {
		type: READER_LIST__RECEIVE_CURRENT_USER_SUBSCRIBED_LISTS,
		lists,
	};
}

/**
 * Request the current user's subscribed lists.
 * @returns {Object}       Action object
 */
export function requestCurrentUserSubscribedLists() {
	return {
		type: READER_LIST__REQUEST_CURRENT_USER_SUBSCRIBED_LISTS,
	};
}

export function createReaderList( list ) {
	return { type: READER_LIST__CREATE, list };
}

/**
 * Request a single Reader list.
 * @param  {string}  listOwner List owner
 * @param  {string}  listSlug List slug
 * @returns {Object}       Action object
 */
export function requestTargetList( listOwner, listSlug ) {
	return { type: READER_LIST__REQUEST_TARGET_LIST, listOwner, listSlug };
}

/**
 * Receive a single Reader list.
 * @param  {Object} data List data
 * @returns {Object}    Action object
 */
export function receiveTargetList( data ) {
	return {
		type: READER_LIST__RECEIVE_TARGET_LIST,
		data,
	};
}

export function receiveCreateReaderList( data ) {
	return {
		type: READER_LIST__CREATE_SUCCESS,
		data,
	};
}

export function handleCreateReaderListFailure( errorInfo ) {
	return {
		type: READER_LIST__CREATE_FAILURE,
		error: errorInfo.error,
		owner: errorInfo.owner,
		slug: errorInfo.slug,
	};
}

/**
 * Follow a list.
 * @param  {string}  listOwner List owner
 * @param  {string}  listSlug List slug
 * @returns {Object}       Action object
 */
export function followList( listOwner, listSlug ) {
	return {
		type: READER_LIST__FOLLOW,
		listOwner,
		listSlug,
	};
}

/**
 * Receive a successful list follow.
 * @param  {Object} list Followed list
 * @returns {Object} Action object
 */
export function receiveFollowList( list ) {
	return {
		type: READER_LIST__FOLLOW_RECEIVE,
		list,
	};
}

/**
 * Unfollow a list.
 * @param  {string}  listOwner List owner
 * @param  {string}  listSlug List slug
 * @returns {Object}       Action object
 */
export function unfollowList( listOwner, listSlug ) {
	return {
		type: READER_LIST__UNFOLLOW,
		listOwner,
		listSlug,
	};
}

/**
 * Receive a successful list unfollow.
 * @param  {Object} list Unfollowed list
 * @returns {Object}    Action object
 */
export function receiveUnfollowList( list ) {
	return {
		type: READER_LIST__UNFOLLOW_RECEIVE,
		list,
	};
}

/**
 * Triggers a network request to update a list's details.
 * @param   {Object} list List details to save
 * @returns {Object} Action object
 */
export function updateReaderList( list ) {
	if ( ! list || ! list.owner || ! list.slug || ! list.title ) {
		throw new Error( 'List owner, slug and title are required' );
	}

	return {
		type: READER_LIST__UPDATE,
		list,
	};
}

/**
 * Handle updated list object from the API.
 * @param   {Object} data List to save
 * @returns {Object} Action object
 */
export function receiveUpdatedListDetails( data ) {
	return {
		type: READER_LIST__UPDATE_SUCCESS,
		data,
	};
}

/**
 * Handle an error from the list update API.
 * @param   {Error}  error Error during the list update process
 * @param   {Object} list List details to save
 * @returns {Object} Action object
 */
export function handleUpdateListDetailsError( error, list ) {
	return {
		type: READER_LIST__UPDATE_FAILURE,
		error,
		list,
	};
}

export const requestReaderListItems = ( listOwner, listSlug ) => ( {
	type: READER_LIST__ITEMS_REQUEST,
	listOwner,
	listSlug,
} );

export const receiveReaderListItems = ( listId, listItems ) => ( {
	type: READER_LIST__ITEMS_RECEIVE,
	listId,
	listItems,
} );

export const deleteReaderListFeed = ( listId, listOwner, listSlug, feedId ) => ( {
	type: READER_LIST__ITEM_DELETE_FEED,
	listId,
	listOwner,
	listSlug,
	feedId,
} );

export const deleteReaderListSite = ( listId, listOwner, listSlug, siteId ) => ( {
	type: READER_LIST__ITEM_DELETE_SITE,
	listId,
	listOwner,
	listSlug,
	siteId,
} );

export const deleteReaderListTag = ( listId, listOwner, listSlug, tagId, tagSlug ) => ( {
	type: READER_LIST__ITEM_DELETE_TAG,
	listId,
	listOwner,
	listSlug,
	tagId,
	tagSlug,
} );

export const addReaderListFeed = ( listId, listOwner, listSlug, feedId ) => ( {
	type: READER_LIST__ITEM_ADD_FEED,
	listId,
	listOwner,
	listSlug,
	feedId,
} );

export const addReaderListFeedByUrl = ( listId, listOwner, listSlug, feedUrl ) => ( {
	type: READER_LIST__ITEM_ADD_FEED,
	listId,
	listOwner,
	listSlug,
	feedUrl,
} );

export const addReaderListSite = ( listId, listOwner, listSlug, siteId ) => ( {
	type: READER_LIST__ITEM_ADD_FEED,
	listId,
	listOwner,
	listSlug,
	siteId,
} );

export const addReaderListTag = ( listId, listOwner, listSlug, tagSlug ) => ( {
	type: READER_LIST__ITEM_ADD_TAG,
	listId,
	listOwner,
	listSlug,
	tagSlug,
} );

export const receiveAddReaderListFeed = ( listId, listOwner, listSlug, feedId ) => ( {
	type: READER_LIST__ITEM_ADD_FEED_RECEIVE,
	listId,
	listOwner,
	listSlug,
	feedId,
} );

export const receiveAddReaderListTag = ( listId, listOwner, listSlug, tagSlug, tagId ) => ( {
	type: READER_LIST__ITEM_ADD_TAG_RECEIVE,
	listId,
	listOwner,
	listSlug,
	tagSlug,
	tagId,
} );

export const deleteReaderList = ( listId, listOwner, listSlug ) => ( {
	type: READER_LIST__DELETE,
	listId,
	listOwner,
	listSlug,
} );

export function requestUserLists( userSlug ) {
	return {
		type: READER_USER__REQUEST_LISTS,
		userSlug,
	};
}
