/**
 * Internal dependencies
 */
import { getPostCommentsTree } from 'calypso/state/comments/selectors/get-post-comments-tree';

import 'calypso/state/comments/init';

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
	const parentCommentId = commentsTree[ commentId ]?.data.parent?.ID ?? 0;
	return commentsTree[ parentCommentId ]?.data ?? {};
};
