/** @format */

/**
 * Internal dependencies
 */

import { POST_REVISION_AUTHORS_RECEIVE, POST_REVISIONS_AUTHORS_REQUEST } from 'state/action-types';

import 'state/data-layer/wpcom/sites/users';

/**
 * Action creator for receiving an array of users from REST response
 * @param {Array} users Users received
 * @return {Object} Action object
 */
export function receivePostRevisionAuthors( users ) {
	return {
		type: POST_REVISION_AUTHORS_RECEIVE,
		users,
	};
}

/**
 * Action creator function: POST_REVISIONS_AUTHORS_REQUEST
 *
 * @param {String} siteId of the users
 * @param {Array}  ids of the users (array of integers)
 * @return {Object} action object
 */
export const requestPostRevisionAuthors = ( siteId, ids ) => ( {
	type: POST_REVISIONS_AUTHORS_REQUEST,
	ids,
	siteId,
} );
