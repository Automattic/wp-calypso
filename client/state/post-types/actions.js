/** @format */

/**
 * Internal dependencies
 */

import { POST_TYPES_RECEIVE, POST_TYPES_REQUEST } from 'state/action-types';

import 'state/data-layer/wpcom/sites/post-types';

/**
 * Returns an action object to be used in signalling that post types for a site
 * have been received.
 *
 * @param  {Number} siteId Site ID
 * @param  {Array}  types  Post types received
 * @return {Object}        Action object
 */
export function receivePostTypes( siteId, types ) {
	return {
		type: POST_TYPES_RECEIVE,
		siteId,
		types,
	};
}

/**
 * Triggers a network request to retrieve post types for a site.
 *
 * @param  {Number} siteId Site ID
 * @return {Object}        Action object
 */
export function requestPostTypes( siteId ) {
	return {
		type: POST_TYPES_REQUEST,
		siteId,
	};
}
