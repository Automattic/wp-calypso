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
	READER_RECOMMENDED_BLOGS_ITEMS_RECEIVE,
	READER_RECOMMENDED_BLOGS_ITEMS_REQUEST,
	READER_RECOMMENDED_BLOGS_ITEMS_REQUEST_FAILURE,
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
import type { ReaderList, Item as ListItem } from 'calypso/reader/list-manage/types';
import type { CalypsoDispatch } from 'calypso/state/types';
import type { AppState } from 'calypso/types';

// Local type definitions
interface ErrorInfo {
	error: unknown;
	owner?: string;
	slug?: string;
}

interface ReaderListAction {
	type: string;
	[ key: string ]: unknown;
}

/**
 * Returns an action object to signal that list objects have been received.
 * @param lists - Lists received
 * @returns Action object
 */
export function receiveLists( lists: ReaderList[] ): ReaderListAction {
	return {
		type: READER_LISTS_RECEIVE,
		lists,
	};
}

/**
 * Request the current user's subscribed lists.
 * @returns Action object
 */
export function requestSubscribedLists(): ReaderListAction {
	return {
		type: READER_LISTS_REQUEST,
	};
}

export function createReaderList( list: ReaderList ): ReaderListAction {
	return { type: READER_LIST_CREATE, list };
}

/**
 * Request a single Reader list.
 * @param listOwner - List owner
 * @param listSlug - List slug
 * @returns Action object
 */
export function requestList( listOwner: string, listSlug: string ): ReaderListAction {
	return { type: READER_LIST_REQUEST, listOwner, listSlug };
}

/**
 * Receive a single Reader list.
 * @param data - List data
 * @param data.list - Reader list object
 * @returns Action object
 */
export function receiveReaderList( data: { list: ReaderList } ): ReaderListAction {
	return { type: READER_LIST_RECEIVE, data };
}

export function handleRequestListFailure( errorInfo: ErrorInfo ): ReaderListAction {
	return {
		type: READER_LIST_REQUEST_FAILURE,
		error: errorInfo.error,
		owner: errorInfo.owner,
		slug: errorInfo.slug,
	};
}

export function receiveCreateReaderList( data: { list: ReaderList } ): ReaderListAction {
	return {
		type: READER_LIST_CREATE_SUCCESS,
		data,
	};
}

export function handleCreateReaderListFailure( errorInfo: ErrorInfo ): ReaderListAction {
	return {
		type: READER_LIST_CREATE_FAILURE,
		error: errorInfo.error,
		owner: errorInfo.owner,
		slug: errorInfo.slug,
	};
}

/**
 * Follow a list.
 * @param listOwner - List owner
 * @param listSlug - List slug
 * @returns Action object
 */
export function followList( listOwner: string, listSlug: string ): ReaderListAction {
	return {
		type: READER_LIST_FOLLOW,
		listOwner,
		listSlug,
	};
}

/**
 * Receive a successful list follow.
 * @param list - Followed list
 * @returns Action object
 */
export function receiveFollowList( list: ReaderList ): ReaderListAction {
	return {
		type: READER_LIST_FOLLOW_RECEIVE,
		list,
	};
}

/**
 * Unfollow a list.
 * @param listOwner - List owner
 * @param listSlug - List slug
 * @returns Action object
 */
export function unfollowList( listOwner: string, listSlug: string ): ReaderListAction {
	return {
		type: READER_LIST_UNFOLLOW,
		listOwner,
		listSlug,
	};
}

/**
 * Receive a successful list unfollow.
 * @param list - Unfollowed list
 * @returns Action object
 */
export function receiveUnfollowList( list: ReaderList ): ReaderListAction {
	return {
		type: READER_LIST_UNFOLLOW_RECEIVE,
		list,
	};
}

/**
 * Triggers a network request to update a list's details.
 * @param list - List details to save
 * @returns Action object
 */
export function updateReaderList( list: ReaderList ): ReaderListAction {
	// Validate required properties to prevent runtime errors in JavaScript components
	if ( ! list || ! list.title || ! list.slug || ! list.owner ) {
		throw new Error( 'updateReaderList: list must have title, slug, and owner properties' );
	}

	return {
		type: READER_LIST_UPDATE,
		list,
	};
}

/**
 * Handle updated list object from the API.
 * @param data - List data
 * @param data.list - List to save
 * @returns Action object
 */
export function receiveUpdatedListDetails( data: { list: ReaderList } ): ReaderListAction {
	return {
		type: READER_LIST_UPDATE_SUCCESS,
		data,
	};
}

/**
 * Handle an error from the list update API.
 * @param error - Error during the list update process
 * @param list - List details to save
 * @returns Action object
 */
export function handleUpdateListDetailsError( error: unknown, list: ReaderList ): ReaderListAction {
	return {
		type: READER_LIST_UPDATE_FAILURE,
		error,
		list,
	};
}

export const requestReaderListItems = (
	listOwner: string,
	listSlug: string
): ReaderListAction => ( {
	type: READER_LIST_ITEMS_REQUEST,
	listOwner,
	listSlug,
} );

export const receiveReaderListItems = (
	listId: number,
	listItems: ListItem[]
): ReaderListAction => ( {
	type: READER_LIST_ITEMS_RECEIVE,
	listId,
	listItems,
} );

export const deleteReaderListFeed = (
	listId: number,
	listOwner: string,
	listSlug: string,
	feedId: number
): ReaderListAction => ( {
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
): ReaderListAction => ( {
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
): ReaderListAction => ( {
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
): ReaderListAction => ( {
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
): ReaderListAction => ( {
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
): ReaderListAction => ( {
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
): ReaderListAction => ( {
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
): ReaderListAction => ( {
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
): ReaderListAction => ( {
	type: READER_LIST_ITEM_ADD_TAG_RECEIVE,
	listId,
	listOwner,
	listSlug,
	tagSlug,
	tagId,
} );

export const deleteReaderList = (
	listId: number,
	listOwner: string,
	listSlug: string
): ReaderListAction => ( {
	type: READER_LIST_DELETE,
	listId,
	listOwner,
	listSlug,
} );

export function requestUserLists( userLogin: string ): ReaderListAction {
	return {
		type: READER_USER_LISTS_REQUEST,
		userLogin,
	};
}

export const receiveReaderRecommendedBlogsItems = ( listOwner: string, listItems: object ) => ( {
	type: READER_RECOMMENDED_BLOGS_ITEMS_RECEIVE,
	listOwner,
	listItems,
} );

export const handleRecommendedBlogsRequestFailure = ( listOwner: string, error: string ) => ( {
	type: READER_RECOMMENDED_BLOGS_ITEMS_REQUEST_FAILURE,
	listOwner,
	error,
} );

/**
 * Request user recommended blogs only if no request is already in progress.
 * This prevents duplicate requests for the same user.
 * @param {string} listOwner User login of list owner
 * @returns {Function} Thunk that checks state before dispatching
 */
export function requestUserRecommendedBlogs( listOwner: string ) {
	return ( dispatch: CalypsoDispatch, getState: () => AppState ) => {
		const isRequesting = getState().reader.lists.isRequestingUserRecommendedBlogs[ listOwner ];

		if ( ! isRequesting ) {
			dispatch( {
				type: READER_RECOMMENDED_BLOGS_ITEMS_REQUEST,
				listOwner,
			} );
		}
	};
}
