/** @format */

/**
 * External dependencies
 */

import { castArray } from 'lodash';

/**
 * Internal dependencies
 */
import {
	MEDIA_DELETE,
	MEDIA_ITEM_REQUEST,
	MEDIA_ITEM_REQUEST_FAILURE,
	MEDIA_ITEM_REQUEST_SUCCESS,
	MEDIA_ITEM_REQUESTING,
	MEDIA_RECEIVE,
	MEDIA_REQUEST,
	MEDIA_REQUEST_FAILURE,
	MEDIA_REQUEST_SUCCESS,
	MEDIA_REQUESTING,
} from 'state/action-types';

import 'state/data-layer/wpcom/sites/media';

/**
 * Returns an action object used in signalling that media item(s) for the site
 * have been received.
 *
 * @param  {Number}         siteId Site ID
 * @param  {(Array|Object)} media  Media item(s) received
 * @param  {Number}         found  Number of found media
 * @param  {Object}         query  Query Object
 * @return {Object}                Action object
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
 * @param  {Number} siteId Site ID
 * @param  {Object} query  Query object
 * @return {Object}        Action object
 */
export function requestMedia( siteId, query ) {
	return {
		type: MEDIA_REQUEST,
		siteId,
		query,
	};
}

/**
 * Returns an action object used in signalling that media item(s) for the site
 * are being requested.
 *
 * @param  {Number} siteId Site ID
 * @param  {Object} query  Query object
 * @return {Object}        Action object
 */
export function requestingMedia( siteId, query ) {
	return {
		type: MEDIA_REQUESTING,
		siteId,
		query,
	};
}

/**
 * Returns an action object used in signalling that a request for media item(s)
 * has failed.
 *
 * @param  {Number} siteId Site ID
 * @param  {Object} query  Query object
 * @return {Object}        Action object
 */
export function failMediaRequest( siteId, query ) {
	return {
		type: MEDIA_REQUEST_FAILURE,
		siteId,
		query,
	};
}

/**
 * Returns an action object used in signalling that a request for media item(s)
 * has failed.
 *
 * @param  {Number} siteId Site ID
 * @param  {Object} query  Query object
 * @return {Object}        Action object
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
 * @param  {Number} siteId  Site ID
 * @param  {Number} mediaId Media ID
 * @return {Object}         Action object
 */
export function requestMediaItem( siteId, mediaId ) {
	return {
		type: MEDIA_ITEM_REQUEST,
		siteId,
		mediaId,
	};
}

/**
 * Returns an action object used in signalling that a media item for the site
 * are being requested.
 *
 * @param  {Number} siteId  Site ID
 * @param  {Number} mediaId Media ID
 * @return {Object}         Action object
 */
export function requestingMediaItem( siteId, mediaId ) {
	return {
		type: MEDIA_ITEM_REQUESTING,
		siteId,
		mediaId,
	};
}

/**
 * Returns an action object used in signalling that a request for media item(s)
 * has failed.
 *
 * @param  {Number} siteId  Site ID
 * @param  {Number} mediaId Media ID
 * @return {Object}         Action object
 */
export function failMediaItemRequest( siteId, mediaId ) {
	return {
		type: MEDIA_ITEM_REQUEST_FAILURE,
		siteId,
		mediaId,
	};
}

/**
 * Returns an action object used in signalling that a request for media item(s)
 * has failed.
 *
 * @param  {Number} siteId  Site ID
 * @param  {Number} mediaId Media ID
 * @return {Object}         Action object
 */
export function successMediaItemRequest( siteId, mediaId ) {
	return {
		type: MEDIA_ITEM_REQUEST_SUCCESS,
		siteId,
		mediaId,
	};
}

/**
 * Returns an action object used in signalling that media item(s) for the site
 * are to be deleted.
 *
 * TODO: When network layer behavior is attached to this action type, remember
 * to ignore media IDs for "transient" items (upload in progress) by validating
 * numeric ID.
 *
 * @param  {Number}         siteId   Site ID
 * @param  {(Array|Number)} mediaIds ID(s) of media to be deleted
 * @return {Object}                  Action object
 */
export function deleteMedia( siteId, mediaIds ) {
	return {
		type: MEDIA_DELETE,
		mediaIds: castArray( mediaIds ),
		siteId,
	};
}
