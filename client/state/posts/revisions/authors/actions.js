/**
 * Internal dependencies
 */

import {
	POST_REVISION_AUTHORS_RECEIVE,
	POST_REVISIONS_AUTHORS_REQUEST,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/sites/users';

import 'calypso/state/posts/init';

/**
 * Action creator for receiving an array of users from REST response
 *
 * @param {Array} users Users received
 * @returns {object} Action object
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
 * @param {string} siteId of the users
 * @param {Array}  ids of the users (array of integers)
 * @returns {object} action object
 */
export const requestPostRevisionAuthors = ( siteId, ids ) => ( {
	type: POST_REVISIONS_AUTHORS_REQUEST,
	ids,
	siteId,
} );
