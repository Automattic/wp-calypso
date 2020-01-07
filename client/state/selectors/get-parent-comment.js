/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getPostCommentsTree } from 'state/comments/selectors';

/**
 * Returns the parent comment of a given comment
 *
 * @param {object} state Redux state
 * @param {number} siteId Site identifier
 * @param {number} postId Post identifier
 * @param {number} commentId Comment identifier
 * @returns {object} The parent comment
 */
export const getParentComment = ( state, siteId, postId, commentId ) => {
	const commentsTree = getPostCommentsTree( state, siteId, postId, 'all' );
	const parentCommentId = get( commentsTree, [ commentId, 'data', 'parent', 'ID' ], 0 );
	return get( commentsTree, [ parentCommentId, 'data' ], {} );
};

export default getParentComment;
