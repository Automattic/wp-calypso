/**
 * Internal dependencies
 */
import { POST_GEO_IMAGE_RECEIVE, POST_GEO_IMAGE_REQUEST } from 'state/action-types';
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
 * Action creator function: POST_REVISIONS_REQUEST
 *
 * @param {string} siteId of the post map url.
 * @param {string} postId of the post map url.
 * @param {string} latitude ;atitude position coodinate.
 * @param {string} longitude longitude position coodinate.
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
