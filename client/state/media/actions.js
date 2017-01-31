/**
 * External dependencies
 */
import { castArray } from 'lodash';

/**
 * Internal dependencies
 */
import {
	MEDIA_DELETE,
	MEDIA_RECEIVE,
	MEDIA_REQUEST,
	MEDIA_REQUEST_FAILURE,
	MEDIA_REQUESTING } from 'state/action-types';

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
		query
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
		query
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
		query
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
		query
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
		siteId
	};
}
