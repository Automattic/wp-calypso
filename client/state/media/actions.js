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
	MEDIA_ITEMS_RECEIVE,
	MEDIA_ITEMS_REQUEST,
	MEDIA_ITEMS_REQUESTING
} from 'state/action-types';

/**
 * Returns an action object used in signalling that media item(s) for the site
 * have been received.
 *
 * @param  {Number}         siteId Site ID
 * @param  {(Array|Object)} media  Media item(s) received
 * @return {Object}                Action object
 */
export function receiveMedia( siteId, media ) {
	return {
		type: MEDIA_RECEIVE,
		media: castArray( media ),
		siteId
	};
}

/**
 * Returns an action object used in signalling that media item(s) for the site
 * are to be deleted.
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

export function receiveMediaItems( siteId, query, items, found ) {
	return {
		type: MEDIA_ITEMS_RECEIVE,
		siteId,
		query,
		items,
		found
	};
}

export function requestMediaItems( siteId, query ) {
	return {
		type: MEDIA_ITEMS_REQUEST,
		siteId,
		query
	};
}

export function requestingMediaItems( siteId, query ) {
	return {
		type: MEDIA_ITEMS_REQUESTING,
		siteId,
		query
	};
}
