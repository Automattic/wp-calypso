import {
	MEDIA_DELETE,
	MEDIA_ITEM_CREATE,
	MEDIA_ITEM_REQUEST,
	MEDIA_ITEM_REQUEST_FAILURE,
	MEDIA_ITEM_REQUEST_SUCCESS,
	MEDIA_RECEIVE,
	MEDIA_REQUEST,
	MEDIA_REQUEST_FAILURE,
	MEDIA_REQUEST_SUCCESS,
	MEDIA_SET_NEXT_PAGE_HANDLE,
	MEDIA_SET_QUERY,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/sites/media';
import 'calypso/state/media/init';

/**
 * Returns an action object used in signalling that media item(s) for the site
 * have been received.
 *
 * Note: `media` items may contain an optional `transientId` field which when
 * present denotes the transient ID that referred to the media item.
 * @param  {number}         siteId Site ID
 * @param  {(Array | Object)} media  Media item(s) received
 * @param  {number}         found  Number of found media
 * @param  {Object}         query  Query Object
 * @returns {Object}                Action object
 */
export function receiveMedia( siteId, media, found, query ) {
	return {
		type: MEDIA_RECEIVE,
		siteId,
		media: Array.isArray( media ) ? media : [ media ],
		found,
		query,
	};
}

/**
 * Returns an action object used in signalling that media item(s) for the site
 * have been requested.
 * @param  {number} siteId Site ID
 * @param  {Object} query  Query object
 * @returns {Object}        Action object
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
 * @param  {number} siteId Site ID
 * @param  {Object} query  Query object
 * @param  {Object} error  Error object
 * @returns {Object}        Action object
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
 * @param  {number} siteId Site ID
 * @param  {Object} query  Query object
 * @returns {Object}        Action object
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
 * @param  {number} siteId  Site ID
 * @param  {number} mediaId Media ID
 * @returns {Object}         Action object
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
 * @param  {number} siteId  Site ID
 * @param  {number} mediaId Media ID
 * @param  {Object} error   Error object
 * @returns {Object}         Action object
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
 * @param  {number} siteId  Site ID
 * @param  {number} mediaId Media ID
 * @returns {Object}         Action object
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
 * @param  {Object}  site           Site object
 * @param  {Object}  transientMedia Fake incomplete media item, used before media is sent to the server
 * @returns {Object}                Action object
 */
export function createMediaItem( site, transientMedia ) {
	return {
		type: MEDIA_ITEM_CREATE,
		site,
		transientMedia,
	};
}

/**
 * Returns an action object used in signalling that media item(s) for the site
 * are to be deleted.
 *
 * TODO: When network layer behavior is attached to this action type, remember
 * to ignore media IDs for "transient" items (upload in progress) by validating
 * numeric ID.
 * @param  {number}         siteId   Site ID
 * @param  {(Array|number)} mediaIds ID(s) of media to be deleted
 * @returns {Object}                  Action object
 */
export function deleteMedia( siteId, mediaIds ) {
	return {
		type: MEDIA_DELETE,
		mediaIds: Array.isArray( mediaIds ) ? mediaIds : [ mediaIds ],
		siteId,
	};
}

/**
 * Returns an action object used in signallying that a new next page handle
 * needs to be set based on the metadata from a media request.
 * @param {number} siteId Site ID
 * @param {Object} mediaRequestMeta The `meta` object from a media request data
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
 * @param {number} siteId Site ID
 * @param {Object} query query object
 */
export function setQuery( siteId, query ) {
	return {
		type: MEDIA_SET_QUERY,
		siteId,
		query,
	};
}
