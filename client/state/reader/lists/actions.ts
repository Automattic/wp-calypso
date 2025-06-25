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

// Type definitions based on API usage patterns
interface ReaderList {
	ID?: number;
	title: string;
	slug: string;
	description?: string;
	owner: string;
	is_owner?: boolean;
	is_public?: boolean;
	is_immutable?: boolean;
}

interface ErrorInfo {
	error: unknown;
	owner?: string;
	slug?: string;
}

/**
 * Returns an action object to signal that list objects have been received.
 * @param  {Array}  lists Lists received
 * @returns {Object}       Action object
 */
export function receiveLists( lists: ReaderList[] ) {
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

export function createReaderList( list: ReaderList ) {
	return { type: READER_LIST_CREATE, list };
}

/**
 * Request a single Reader list.
 * @param  {string}  listOwner List owner
 * @param  {string}  listSlug List slug
 * @returns {Object}       Action object
 */
export function requestList( listOwner: string, listSlug: string ) {
	return { type: READER_LIST_REQUEST, listOwner, listSlug };
}

/**
 * Receive a single Reader list.
 * @param  {Object}  data List data
 * @param  {Object}  data.list Reader list object
 * @returns {Object}       Action object
 */
export function receiveReaderList( data: { list: ReaderList } ) {
	return { type: READER_LIST_RECEIVE, data };
}

export function handleRequestListFailure( errorInfo: ErrorInfo ) {
	return {
		type: READER_LIST_REQUEST_FAILURE,
		error: errorInfo.error,
		owner: errorInfo.owner,
		slug: errorInfo.slug,
	};
}

export function receiveCreateReaderList( data: { list: ReaderList } ) {
	return {
		type: READER_LIST_CREATE_SUCCESS,
		data,
	};
}

export function handleCreateReaderListFailure( errorInfo: ErrorInfo ) {
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
export function followList( listOwner: string, listSlug: string ) {
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
export function receiveFollowList( list: ReaderList ) {
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
export function unfollowList( listOwner: string, listSlug: string ) {
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
export function receiveUnfollowList( list: ReaderList ) {
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
export function updateReaderList( list: ReaderList ) {
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
 * @param   {Object} data List data
 * @param   {Object} data.list List to save
 * @returns {Object} Action object
 */
export function receiveUpdatedListDetails( data: { list: ReaderList } ) {
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
export function handleUpdateListDetailsError( error: unknown, list: ReaderList ) {
	return {
		type: READER_LIST_UPDATE_FAILURE,
		error,
		list,
	};
}

export const requestReaderListItems = ( listOwner: string, listSlug: string ) => ( {
	type: READER_LIST_ITEMS_REQUEST,
	listOwner,
	listSlug,
} );

export const receiveReaderListItems = ( listId: number, listItems: unknown ) => ( {
	type: READER_LIST_ITEMS_RECEIVE,
	listId,
	listItems,
} );

export const deleteReaderListFeed = (
	listId: number,
	listOwner: string,
	listSlug: string,
	feedId: number
) => ( {
	type: READER_LIST_ITEM_DELETE_FEED,
	listId,
	listOwner,
	listSlug,
	feedId,
} );

export const deleteReaderListSite = (
	listId: number,
	listOwner: string,
	listSlug: string,
	siteId: number
) => ( {
	type: READER_LIST_ITEM_DELETE_SITE,
	listId,
	listOwner,
	listSlug,
	siteId,
} );

export const deleteReaderListTag = (
	listId: number,
	listOwner: string,
	listSlug: string,
	tagId: number,
	tagSlug: string
) => ( {
	type: READER_LIST_ITEM_DELETE_TAG,
	listId,
	listOwner,
	listSlug,
	tagId,
	tagSlug,
} );

export const addReaderListFeed = (
	listId: number,
	listOwner: string,
	listSlug: string,
	feedId: number
) => ( {
	type: READER_LIST_ITEM_ADD_FEED,
	listId,
	listOwner,
	listSlug,
	feedId,
} );

export const addReaderListFeedByUrl = (
	listId: number,
	listOwner: string,
	listSlug: string,
	feedUrl: string
) => ( {
	type: READER_LIST_ITEM_ADD_FEED,
	listId,
	listOwner,
	listSlug,
	feedUrl,
} );

export const addReaderListSite = (
	listId: number,
	listOwner: string,
	listSlug: string,
	siteId: number
) => ( {
	type: READER_LIST_ITEM_ADD_FEED,
	listId,
	listOwner,
	listSlug,
	siteId,
} );

export const addReaderListTag = (
	listId: number,
	listOwner: string,
	listSlug: string,
	tagSlug: string
) => ( {
	type: READER_LIST_ITEM_ADD_TAG,
	listId,
	listOwner,
	listSlug,
	tagSlug,
} );

export const receiveAddReaderListFeed = (
	listId: number,
	listOwner: string,
	listSlug: string,
	feedId: number
) => ( {
	type: READER_LIST_ITEM_ADD_FEED_RECEIVE,
	listId,
	listOwner,
	listSlug,
	feedId,
} );

export const receiveAddReaderListTag = (
	listId: number,
	listOwner: string,
	listSlug: string,
	tagSlug: string,
	tagId: number
) => ( {
	type: READER_LIST_ITEM_ADD_TAG_RECEIVE,
	listId,
	listOwner,
	listSlug,
	tagSlug,
	tagId,
} );

export const deleteReaderList = ( listId: number, listOwner: string, listSlug: string ) => ( {
	type: READER_LIST_DELETE,
	listId,
	listOwner,
	listSlug,
} );

export function requestUserLists( userLogin: string ) {
	return {
		type: READER_USER_LISTS_REQUEST,
		userLogin,
	};
}
