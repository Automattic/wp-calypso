/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import {
	READER_LIST_CREATE,
	READER_LIST_DISMISS_NOTICE,
	READER_LIST_ITEMS_REQUEST,
	READER_LIST_ITEMS_RECEIVE,
	READER_LIST_ITEM_DELETE_FEED,
	READER_LIST_ITEM_DELETE_SITE,
	READER_LIST_ITEM_DELETE_TAG,
	READER_LIST_REQUEST,
	READER_LIST_REQUEST_SUCCESS,
	READER_LIST_REQUEST_FAILURE,
	READER_LIST_UPDATE,
	READER_LIST_UPDATE_SUCCESS,
	READER_LIST_UPDATE_FAILURE,
	READER_LIST_ITEM_ADD_FEED,
	READER_LIST_ITEM_ADD_FEED_RECEIVE,
	READER_LIST_ITEM_ADD_TAG,
	READER_LIST_ITEM_ADD_TAG_RECEIVE,
	READER_LISTS_RECEIVE,
	READER_LISTS_REQUEST,
	READER_LISTS_REQUEST_SUCCESS,
	READER_LISTS_REQUEST_FAILURE,
	READER_LISTS_FOLLOW,
	READER_LISTS_FOLLOW_SUCCESS,
	READER_LISTS_FOLLOW_FAILURE,
	READER_LISTS_UNFOLLOW,
	READER_LISTS_UNFOLLOW_SUCCESS,
	READER_LISTS_UNFOLLOW_FAILURE,
} from 'calypso/state/reader/action-types';

import 'calypso/state/data-layer/wpcom/read/lists';
import 'calypso/state/data-layer/wpcom/read/lists/items';
import 'calypso/state/data-layer/wpcom/read/lists/feeds/delete';
import 'calypso/state/data-layer/wpcom/read/lists/tags/delete';
import 'calypso/state/data-layer/wpcom/read/lists/feeds/new';
import 'calypso/state/reader/init';

/**
 * Returns an action object to signal that list objects have been received.
 *
 * @param  {Array}  lists Lists received
 * @returns {object}       Action object
 */
export function receiveLists( lists ) {
	return {
		type: READER_LISTS_RECEIVE,
		lists,
	};
}

/**
 * Triggers a network request to fetch the current user's lists.
 *
 * @returns {Function}        Action thunk
 */
export function requestSubscribedLists() {
	return ( dispatch ) => {
		dispatch( {
			type: READER_LISTS_REQUEST,
		} );

		return new Promise( ( resolve, reject ) => {
			wpcom.undocumented().readLists( ( error, data ) => {
				error ? reject( error ) : resolve( data );
			} );
		} )
			.then( ( data ) => {
				dispatch( receiveLists( data.lists ) );
				dispatch( {
					type: READER_LISTS_REQUEST_SUCCESS,
					data,
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: READER_LISTS_REQUEST_FAILURE,
					error,
				} );
			} );
	};
}

export function createReaderList( list ) {
	return { type: READER_LIST_CREATE, list };
}

/**
 * Triggers a network request to fetch a single Reader list.
 *
 * @param  {string}  owner List owner
 * @param  {string}  slug List slug
 * @returns {Function}        Action thunk
 */
export function requestList( owner, slug ) {
	return ( dispatch ) => {
		dispatch( {
			type: READER_LIST_REQUEST,
		} );

		const query = createQuery( owner, slug );

		return new Promise( ( resolve, reject ) => {
			wpcom.undocumented().readList( query, ( error, data ) => {
				if ( error ) {
					const errorInfo = {
						error,
						owner,
						slug,
					};
					reject( errorInfo );
				} else {
					resolve( data );
				}
			} );
		} )
			.then( ( data ) => {
				dispatch( receiveReaderList( data ) );
			} )
			.catch( ( errorInfo ) => dispatch( handleReaderListRequestFailure( errorInfo ) ) );
	};
}

export function receiveReaderList( data ) {
	return {
		type: READER_LIST_REQUEST_SUCCESS,
		data,
	};
}

export function handleReaderListRequestFailure( errorInfo ) {
	return {
		type: READER_LIST_REQUEST_FAILURE,
		error: errorInfo.error,
		owner: errorInfo.owner,
		slug: errorInfo.slug,
	};
}

/**
 * Triggers a network request to follow a list.
 *
 * @param  {string}  owner List owner
 * @param  {string}  slug List slug
 * @returns {Function} Action promise
 */
export function followList( owner, slug ) {
	return ( dispatch ) => {
		dispatch( {
			type: READER_LISTS_FOLLOW,
			owner,
			slug,
		} );

		const query = createQuery( owner, slug );

		return new Promise( ( resolve, reject ) => {
			wpcom.undocumented().followList( query, ( error, data ) => {
				error ? reject( error ) : resolve( data );
			} );
		} )
			.then( ( data ) => {
				dispatch( {
					type: READER_LISTS_FOLLOW_SUCCESS,
					data,
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: READER_LISTS_FOLLOW_FAILURE,
					error,
				} );
			} );
	};
}

/**
 * Triggers a network request to unfollow a list.
 *
 * @param  {string}  owner List owner
 * @param  {string}  slug List slug
 * @returns {Function} Action promise
 */
export function unfollowList( owner, slug ) {
	return ( dispatch ) => {
		dispatch( {
			type: READER_LISTS_UNFOLLOW,
			owner,
			slug,
		} );

		const query = createQuery( owner, slug );

		return new Promise( ( resolve, reject ) => {
			wpcom.undocumented().unfollowList( query, ( error, data ) => {
				error ? reject( error ) : resolve( data );
			} );
		} )
			.then( ( data ) => {
				dispatch( {
					type: READER_LISTS_UNFOLLOW_SUCCESS,
					data,
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: READER_LISTS_UNFOLLOW_FAILURE,
					error,
				} );
			} );
	};
}

/**
 * Triggers a network request to update a list's details.
 *
 * @param   {object} list List details to save
 * @returns {object} Action object
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
 *
 * @param   {object} data List to save
 * @returns {object} Action object
 */
export function receiveUpdatedListDetails( data ) {
	return {
		type: READER_LIST_UPDATE_SUCCESS,
		data,
	};
}

/**
 * Handle an error from the list update API.
 *
 * @param   {Error}  error Error during the list update process
 * @returns {object} Action object
 */
export function handleUpdateListDetailsError( error ) {
	return {
		type: READER_LIST_UPDATE_FAILURE,
		error,
	};
}

/**
 * Trigger an action to dismiss a list update notice.
 *
 * @param  {number}  listId List ID
 * @returns {Function} Action thunk
 */
export function dismissListNotice( listId ) {
	return ( dispatch ) => {
		dispatch( {
			type: READER_LIST_DISMISS_NOTICE,
			listId,
		} );
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

function createQuery( owner, slug ) {
	const preparedOwner = decodeURIComponent( owner );
	const preparedSlug = decodeURIComponent( slug );
	return { owner: preparedOwner, slug: preparedSlug };
}
