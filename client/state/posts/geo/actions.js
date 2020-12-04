/**
 * Internal dependencies
 */
import { POST_GEO_IMAGE_RECEIVE, POST_GEO_IMAGE_REQUEST } from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/posts/geo';
/**
 * Action creator function: POST_GEO_IMAGE_RECEIVE
 *
 * @param {object} response map_url, longitude, latitude, siteId, postId
 */
export const receivePostGeoImageUrl = ( { map_url, longitude, latitude, siteId, postId } ) => ( {
	type: POST_GEO_IMAGE_RECEIVE,
	map_url,
	longitude,
	latitude,
	siteId,
	postId,
} );

/**
 * Action creator function: POST_GEO_IMAGE_REQUEST
 *
 * @param {number} siteId of the post map url.
 * @param {number|null} postId of the post map url.
 * @param {string} latitude latitude position coordinate.
 * @param {string} longitude longitude position coordinate.
 *
 * @returns {object} action object
 */
export const requestPostGeoImageUrl = ( siteId, postId, latitude, longitude ) => ( {
	type: POST_GEO_IMAGE_REQUEST,
	postId,
	siteId,
	latitude,
	longitude,
} );
