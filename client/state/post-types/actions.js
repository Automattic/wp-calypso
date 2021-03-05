/**
 * Internal dependencies
 */
import { POST_TYPES_RECEIVE, POST_TYPES_REQUEST } from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/sites/post-types';
import 'calypso/state/post-types/init';

/**
 * Returns an action object to be used in signalling that post types for a site
 * have been received.
 *
 * @param  {number} siteId Site ID
 * @param  {Array}  types  Post types received
 * @returns {object}        Action object
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
 * @param  {number} siteId Site ID
 * @returns {object}        Action object
 */
export function requestPostTypes( siteId ) {
	return {
		type: POST_TYPES_REQUEST,
		siteId,
	};
}
