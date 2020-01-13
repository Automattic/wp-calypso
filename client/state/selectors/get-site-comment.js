/**
 * External dependencies
 */

import { find } from 'lodash';

/**
 * Internal dependencies
 */
import getSiteComments from 'state/selectors/get-site-comments';

/**
 * Returns a comment for the specified site and comment ID.
 *
 * @param {object} state Redux state
 * @param {number} siteId Site identifier
 * @param {number} commentId Comment identifier
 * @returns {object} The requested comment
 */
export const getSiteComment = ( state, siteId, commentId ) => {
	const comments = getSiteComments( state, siteId );
	return find( comments, { ID: commentId } );
};

export default getSiteComment;
