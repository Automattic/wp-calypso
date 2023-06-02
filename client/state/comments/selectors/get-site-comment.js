import { find } from 'lodash';
import { getSiteComments } from 'calypso/state/comments/selectors';

import 'calypso/state/comments/init';

/**
 * Returns a comment for the specified site and comment ID.
 *
 * @param {Object} state Redux state
 * @param {number} siteId Site identifier
 * @param {number} commentId Comment identifier
 * @returns {Object} The requested comment
 */
export function getSiteComment( state, siteId, commentId ) {
	const comments = getSiteComments( state, siteId );
	return find( comments, { ID: commentId } );
}
