import {
	READER_LIST_ITEMS_REQUEST,
	READER_LIST_ITEMS_RECEIVE,
	READER_LIST_ITEM_DELETE_FEED,
	READER_LIST_ITEM_DELETE_SITE,
	READER_LIST_ITEM_DELETE_TAG,
	READER_LIST_ITEM_ADD_FEED,
	READER_LIST_ITEM_ADD_FEED_RECEIVE,
	READER_LIST_ITEM_ADD_TAG,
	READER_LIST_ITEM_ADD_TAG_RECEIVE,
	READER_RECOMMENDED_BLOGS_ITEMS_RECEIVE,
	READER_RECOMMENDED_BLOGS_ITEMS_REQUEST,
	READER_RECOMMENDED_BLOGS_ITEMS_REQUEST_FAILURE,
} from 'calypso/state/reader/action-types';
import 'calypso/state/data-layer/wpcom/read/lists/items';
import 'calypso/state/data-layer/wpcom/read/lists/feeds/delete';
import 'calypso/state/data-layer/wpcom/read/lists/sites/delete';
import 'calypso/state/data-layer/wpcom/read/lists/tags/delete';
import 'calypso/state/data-layer/wpcom/read/lists/tags/new';
import 'calypso/state/data-layer/wpcom/read/lists/feeds/new';
import 'calypso/state/reader/init';
import type { Item as ListItem } from 'calypso/reader/list-manage/types';
import type { CalypsoDispatch } from 'calypso/state/types';
import type { AppState } from 'calypso/types';

// Local type definitions
interface ReaderListAction {
	type: string;
	[ key: string ]: unknown;
}

export const requestReaderListItems = (
	listOwner: string,
	listSlug: string
): ReaderListAction => ( {
	type: READER_LIST_ITEMS_REQUEST,
	listOwner,
	listSlug,
} );

/**
 * Request items for the recommended blogs list.
 * @param listOwner - Owner of the recommended blogs list (usually current user)
 * @returns Action object
 */
export const requestRecommendedBlogsListItems = ( listOwner: string ): ReaderListAction => ( {
	type: READER_LIST_ITEMS_REQUEST,
	listOwner,
	listSlug: 'recommended-blogs',
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

/**
 * Add a feed to the recommended blogs list.
 * @param listId - List ID of the recommended blogs list
 * @param feedId - Feed ID to add (required for feeds/new endpoint)
 * @param listOwner - Owner of the recommended blogs list
 * @param options - Optional configuration for notices
 * @param options.successMessage - Custom success message
 * @param options.errorMessage - Custom error message
 * @param options.noticeDuration - Duration for notice display
 * @returns Action object
 */
export function addRecommendedBlogsSite(
	listId: number,
	feedId: number,
	listOwner: string,
	options?: {
		successMessage?: string;
		errorMessage?: string;
		noticeDuration?: number;
	}
): ReaderListAction {
	return {
		type: READER_LIST_ITEM_ADD_FEED,
		listId,
		listOwner,
		listSlug: 'recommended-blogs',
		feedId,
		...options,
	};
}

/**
 * Remove a feed from the recommended blogs list.
 * @param listId - List ID of the recommended blogs list
 * @param feedId - Feed ID to remove
 * @param listOwner - Owner of the recommended blogs list
 * @param options - Optional configuration for notices
 * @param options.successMessage - Custom success message
 * @param options.errorMessage - Custom error message
 * @param options.noticeDuration - Duration for notice display
 * @returns Action object
 */
export function removeRecommendedBlogsSite(
	listId: number,
	feedId: number,
	listOwner: string,
	options?: {
		successMessage?: string;
		errorMessage?: string;
		noticeDuration?: number;
	}
): ReaderListAction {
	return {
		type: READER_LIST_ITEM_DELETE_FEED,
		listId,
		listOwner,
		listSlug: 'recommended-blogs',
		feedId,
		...options,
	};
}
