import {
	READER_LIST_CREATE,
	READER_LIST_DELETE,
	READER_LIST_FOLLOW,
	READER_LIST_FOLLOW_RECEIVE,
	READER_LIST_ITEMS_REQUEST,
	READER_LIST_ITEMS_RECEIVE,
	READER_LIST_ITEM_DELETE_FEED,
	READER_LIST_ITEM_DELETE_SITE,
	READER_LIST_ITEM_DELETE_TAG,
	READER_LIST_REQUEST,
	READER_LIST_REQUEST_FAILURE,
	READER_LIST_RECEIVE,
	READER_LIST_CREATE_SUCCESS,
	READER_LIST_CREATE_FAILURE,
	READER_LIST_UNFOLLOW,
	READER_LIST_UNFOLLOW_RECEIVE,
	READER_LIST_UPDATE,
	READER_LIST_UPDATE_SUCCESS,
	READER_LIST_UPDATE_FAILURE,
	READER_LIST_ITEM_ADD_FEED,
	READER_LIST_ITEM_ADD_FEED_RECEIVE,
	READER_LIST_ITEM_ADD_TAG,
	READER_LIST_ITEM_ADD_TAG_RECEIVE,
	READER_LISTS_RECEIVE,
	READER_LISTS_REQUEST,
	READER_USER_LISTS_REQUEST,
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
export function receiveLists( lists ) {
	return {
		type: READER_LISTS_RECEIVE,
		lists,
	};
}

/**
 * Request the current user's subscribed lists.
 * @returns {Object}       Action object
 */
export function requestSubscribedLists() {
	return {
		type: READER_LISTS_REQUEST,
	};
}

export function createReaderList( list ) {
	return { type: READER_LIST_CREATE, list };
}

/**
 * Request a single Reader list.
 * @param  {string}  listOwner List owner
 * @param  {string}  listSlug List slug
 * @returns {Object}       Action object
 */
export function requestList( listOwner, listSlug ) {
	return { type: READER_LIST_REQUEST, listOwner, listSlug };
}

/**
 * Receive a single Reader list.
 * @param  {Object}  data List
 * @returns {Object}       Action object
 */
export function receiveReaderList( data ) {
	return { type: READER_LIST_RECEIVE, data };
}

export function handleRequestListFailure( errorInfo ) {
	return {
		type: READER_LIST_REQUEST_FAILURE,
		error: errorInfo.error,
		owner: errorInfo.owner,
		slug: errorInfo.slug,
	};
}

export function receiveCreateReaderList( data ) {
	return {
		type: READER_LIST_CREATE_SUCCESS,
		data,
	};
}

export function handleCreateReaderListFailure( errorInfo ) {
	return {
		type: READER_LIST_CREATE_FAILURE,
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
		type: READER_LIST_FOLLOW,
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
		type: READER_LIST_FOLLOW_RECEIVE,
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
		type: READER_LIST_UNFOLLOW,
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
		type: READER_LIST_UNFOLLOW_RECEIVE,
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
		type: READER_LIST_UPDATE,
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
		type: READER_LIST_UPDATE_SUCCESS,
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
		type: READER_LIST_UPDATE_FAILURE,
		error,
		list,
	};
}

export const requestReaderListItems = ( listOwner, listSlug ) => ( {
	type: READER_LIST_ITEMS_REQUEST,
	listOwner,
	listSlug,
} );

export const receiveReaderListItems = ( listId, listItems ) => ( {
	type: READER_LIST_ITEMS_RECEIVE,
	listId,
	listItems,
} );

export const deleteReaderListFeed = ( listId, listOwner, listSlug, feedId ) => ( {
	type: READER_LIST_ITEM_DELETE_FEED,
	listId,
	listOwner,
	listSlug,
	feedId,
} );

export const deleteReaderListSite = ( listId, listOwner, listSlug, siteId ) => ( {
	type: READER_LIST_ITEM_DELETE_SITE,
	listId,
	listOwner,
	listSlug,
	siteId,
} );

export const deleteReaderListTag = ( listId, listOwner, listSlug, tagId, tagSlug ) => ( {
	type: READER_LIST_ITEM_DELETE_TAG,
	listId,
	listOwner,
	listSlug,
	tagId,
	tagSlug,
} );

export const addReaderListFeed = ( listId, listOwner, listSlug, feedId ) => ( {
	type: READER_LIST_ITEM_ADD_FEED,
	listId,
	listOwner,
	listSlug,
	feedId,
} );

export const addReaderListFeedByUrl = ( listId, listOwner, listSlug, feedUrl ) => ( {
	type: READER_LIST_ITEM_ADD_FEED,
	listId,
	listOwner,
	listSlug,
	feedUrl,
} );

export const addReaderListSite = ( listId, listOwner, listSlug, siteId ) => ( {
	type: READER_LIST_ITEM_ADD_FEED,
	listId,
	listOwner,
	listSlug,
	siteId,
} );

export const addReaderListTag = ( listId, listOwner, listSlug, tagSlug ) => ( {
	type: READER_LIST_ITEM_ADD_TAG,
	listId,
	listOwner,
	listSlug,
	tagSlug,
} );

export const receiveAddReaderListFeed = ( listId, listOwner, listSlug, feedId ) => ( {
	type: READER_LIST_ITEM_ADD_FEED_RECEIVE,
	listId,
	listOwner,
	listSlug,
	feedId,
} );

export const receiveAddReaderListTag = ( listId, listOwner, listSlug, tagSlug, tagId ) => ( {
	type: READER_LIST_ITEM_ADD_TAG_RECEIVE,
	listId,
	listOwner,
	listSlug,
	tagSlug,
	tagId,
} );

export const deleteReaderList = ( listId, listOwner, listSlug ) => ( {
	type: READER_LIST_DELETE,
	listId,
	listOwner,
	listSlug,
} );

export function requestUserLists( userSlug ) {
	return {
		type: READER_USER_LISTS_REQUEST,
		userSlug,
	};
}
