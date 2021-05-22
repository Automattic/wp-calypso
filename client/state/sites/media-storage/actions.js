/**
 * Internal dependencies
 */

import { SITE_MEDIA_STORAGE_RECEIVE, SITE_MEDIA_STORAGE_REQUEST } from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/sites/media-storage';

/**
 * Triggers a network reqeust to find media storage limits for a given site
 *
 * @param {number} siteId Site ID
 */
export function requestMediaStorage( siteId ) {
	return {
		type: SITE_MEDIA_STORAGE_REQUEST,
		siteId,
	};
}

/**
 * Returns an action object to be used in signalling that a mediaStorage object
 * has been received.
 *
 * @param  {object} mediaStorage received
 * @param  {number} siteId       Site ID
 * @returns {object}              Action object
 */
export function receiveMediaStorage( mediaStorage, siteId ) {
	return {
		type: SITE_MEDIA_STORAGE_RECEIVE,
		mediaStorage,
		siteId,
	};
}
