/**
 * External dependencies
 */

import { castArray } from 'lodash';

/**
 * Internal dependencies
 */
import {
	MEDIA_DELETE,
	MEDIA_ERRORS_CLEAR,
	MEDIA_ITEM_CREATE,
	MEDIA_ITEM_ERRORS_CLEAR,
	MEDIA_ITEM_ERRORS_SET,
	MEDIA_ITEM_REQUEST,
	MEDIA_ITEM_REQUEST_FAILURE,
	MEDIA_ITEM_REQUEST_SUCCESS,
	MEDIA_LIBRARY_SELECTED_ITEMS_UPDATE,
	MEDIA_RECEIVE,
	MEDIA_REQUEST,
	MEDIA_REQUEST_FAILURE,
	MEDIA_REQUEST_SUCCESS,
	MEDIA_SET_NEXT_PAGE_HANDLE,
	MEDIA_SOURCE_CHANGE,
	MEDIA_ITEM_UPDATE,
	MEDIA_ITEM_EDIT,
	MEDIA_ITEM_DELETE,
	MEDIA_SET_QUERY,
	MEDIA_CLEAR_SITE,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/sites/media';

/**
 * Returns an action object used in signalling that media item(s) for the site
 * have been received.
 *
 * Note: `media` items may contain an optional `transientId` field which when
 * present denotes the transient ID that referred to the media item.
 *
 * @param  {number}         siteId Site ID
 * @param  {(Array|object)} media  Media item(s) received
 * @param  {number}         found  Number of found media
 * @param  {object}         query  Query Object
 * @returns {object}                Action object
 */
export function receiveMedia( siteId, media, found, query ) {
	return {
		type: MEDIA_RECEIVE,
		siteId,
		media: castArray( media ),
		found,
		query,
	};
}

/**
 * Returns an action object used in signalling that media item(s) for the site
 * have been requested.
 *
 * @param  {number} siteId Site ID
 * @param  {object} query  Query object
 * @returns {object}        Action object
 */
export function requestMedia( siteId, query ) {
	return {
		type: MEDIA_REQUEST,
		siteId,
		query,
	};
}

/**
 * Returns an action object used in signalling that a request for media item(s)
 * has failed.
 *
 * @param  {number} siteId Site ID
 * @param  {object} query  Query object
 * @param  {object} error  Error object
 * @returns {object}        Action object
 */
export function failMediaRequest( siteId, query, error = null ) {
	return {
		type: MEDIA_REQUEST_FAILURE,
		siteId,
		query,
		error,
	};
}

/**
 * Returns an action object used in signalling that a request for media item(s)
 * has failed.
 *
 * @param  {number} siteId Site ID
 * @param  {object} query  Query object
 * @returns {object}        Action object
 */
export function successMediaRequest( siteId, query ) {
	return {
		type: MEDIA_REQUEST_SUCCESS,
		siteId,
		query,
	};
}

/**
 * Returns an action object used in signalling that a media item for the site
 * have been requested.
 *
 * @param  {number} siteId  Site ID
 * @param  {number} mediaId Media ID
 * @returns {object}         Action object
 */
export function requestMediaItem( siteId, mediaId ) {
	return {
		type: MEDIA_ITEM_REQUEST,
		siteId,
		mediaId,
	};
}

/**
 * Returns an action object used in signalling that a request for media item(s)
 * has failed.
 *
 * @param  {number} siteId  Site ID
 * @param  {number} mediaId Media ID
 * @param  {object} error   Error object
 * @returns {object}         Action object
 */
export function failMediaItemRequest( siteId, mediaId, error = null ) {
	return {
		type: MEDIA_ITEM_REQUEST_FAILURE,
		siteId,
		mediaId,
		error,
	};
}

/**
 * Returns an action object used in signalling that a request for media item(s)
 * has failed.
 *
 * @param  {number} siteId  Site ID
 * @param  {number} mediaId Media ID
 * @returns {object}         Action object
 */
export function successMediaItemRequest( siteId, mediaId ) {
	return {
		type: MEDIA_ITEM_REQUEST_SUCCESS,
		siteId,
		mediaId,
	};
}

/**
 * Returns an action object used in signalling that a media item for the site
 * are being created.
 *
 * @param  {object}  site           Site object
 * @param  {object}  transientMedia Fake incomplete media item, used before media is sent to the server
 * @returns {object}                Action object
 */
export function createMediaItem( site, transientMedia ) {
	return {
		type: MEDIA_ITEM_CREATE,
		site,
		transientMedia,
	};
}

/**
 * Returns an action object used in signalling that media item for the site
 * are to be edited.
 *
 * @param {number} siteId site identifier
 * @param {object} mediaItem media item with updated properties
 * @param {object} data binary updated item data (to be sent to the server)
 */
export const editMediaItem = ( siteId, mediaItem, data ) => ( {
	type: MEDIA_ITEM_EDIT,
	siteId,
	mediaItem,
	data,
} );

/**
 * Returns an action object used in signalling that media item data for the site
 * are to be updated.
 *
 * @param {number} siteId site identifier
 * @param {object} item media item
 */
export const updateMediaItem = ( siteId, item ) => ( {
	type: MEDIA_ITEM_UPDATE,
	siteId,
	item,
} );

/**
 * Returns an action object used in signalling that media item(s) for the site
 * are to be deleted.
 *
 * TODO: When network layer behavior is attached to this action type, remember
 * to ignore media IDs for "transient" items (upload in progress) by validating
 * numeric ID.
 *
 * @param  {number}         siteId   Site ID
 * @param  {(Array|number)} mediaIds ID(s) of media to be deleted
 * @returns {object}                  Action object
 */
export function deleteMedia( siteId, mediaIds ) {
	return {
		type: MEDIA_DELETE,
		mediaIds: castArray( mediaIds ),
		siteId,
	};
}

export const deleteMediaItem = ( siteId, mediaId ) => ( {
	type: MEDIA_ITEM_DELETE,
	siteId,
	mediaId,
} );

/**
 * Returns an action object used in signalling that the media source for the site has changed.
 *
 * @param   {number} siteId Site ID
 * @returns {object}        Action object
 */
export function changeMediaSource( siteId ) {
	return {
		type: MEDIA_SOURCE_CHANGE,
		siteId,
	};
}

/**
 * Returns an action object used in signalling that the media errors of a certain type have been cleared.
 *
 * @param  {number}  siteId    Site ID
 * @param  {string}  errorType Error type
 * @returns {object}           Action object
 */
export function clearMediaErrors( siteId, errorType ) {
	return {
		type: MEDIA_ERRORS_CLEAR,
		siteId,
		errorType,
	};
}

/**
 * Returns an action object used in signalling that the errors for a certain media item have been cleared.
 *
 * @param  {number}   siteId Site ID
 * @param  {number}  mediaId Media ID
 * @returns {object}         Action object
 */
export function clearMediaItemErrors( siteId, mediaId ) {
	return {
		type: MEDIA_ITEM_ERRORS_CLEAR,
		siteId,
		mediaId,
	};
}

/**
 * Returns an action object used in signaling to store errors for a certain media item.
 *
 * @param {number} siteId Site ID
 * @param {(number|string)} mediaId Server or transient media ID to set the errors for
 * @param {Array<object>} errors Errors for the media item
 */
export function setMediaItemErrors( siteId, mediaId, errors ) {
	return {
		type: MEDIA_ITEM_ERRORS_SET,
		siteId,
		mediaId,
		errors,
	};
}

/**
 * Returns an action object used in signalling that new selected media item(s)
 * are being set for the site's media library.
 *
 * @param  {number}  siteId Site ID
 * @param  {Array}   media  Array of media objects
 * @returns {object}        Action object
 */
export function setMediaLibrarySelectedItems( siteId, media ) {
	return {
		type: MEDIA_LIBRARY_SELECTED_ITEMS_UPDATE,
		media,
		siteId,
	};
}

/**
 * Returns an action object used in signallying that a new next page handle
 * needs to be set based on the metadata from a media request.
 *
 * @param {number} siteId Site ID
 * @param {object} mediaRequestMeta The `meta` object from a media request data
 */
export function setNextPageHandle( siteId, mediaRequestMeta ) {
	return {
		type: MEDIA_SET_NEXT_PAGE_HANDLE,
		siteId,
		mediaRequestMeta,
	};
}

/**
 * Returns an action object used in signallying that a new next page handle
 * needs to be set based on the metadata from a media request.
 *
 * @param {number} siteId Site ID
 * @param {object} query query object
 */
export function setQuery( siteId, query ) {
	return {
		type: MEDIA_SET_QUERY,
		siteId,
		query,
	};
}

/**
 * Returns an action object used in signallying that a media data from a given site
 *
 * @param {number} siteId Site ID
 */
export function clearSite( siteId ) {
	return {
		type: MEDIA_CLEAR_SITE,
		siteId,
	};
}
