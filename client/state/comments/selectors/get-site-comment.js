/**
 * External dependencies
 */
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import { getSiteComments } from 'calypso/state/comments/selectors';

import 'calypso/state/comments/init';

/**
 * Returns a comment for the specified site and comment ID.
 *
 * @param {object} state Redux state
 * @param {number} siteId Site identifier
 * @param {number} commentId Comment identifier
 * @returns {object} The requested comment
 */
export function getSiteComment( state, siteId, commentId ) {
	const comments = getSiteComments( state, siteId );
	return find( comments, { ID: commentId } );
}
