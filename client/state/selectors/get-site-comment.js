/** @format */
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
 * @param {Object} state Redux state
 * @param {Number} siteId Site identifier
 * @param {Number} commentId Comment identifier
 * @returns {Object} The requested comment
 */
export const getSiteComment = ( state, siteId, commentId ) => {
	const comments = getSiteComments( state, siteId );
	return find( comments, { ID: commentId } );
};

export default getSiteComment;
