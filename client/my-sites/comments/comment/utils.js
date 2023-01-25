import { get } from 'lodash';

/**
 * Create a stripped down comment object containing only the bare minimum fields needed by CommentList's actions.
 *
 * @param {Object} comment A comment object.
 * @returns {Object} A stripped down comment object.
 */
export const getMinimumComment = ( comment ) => ( {
	commentId: get( comment, 'ID' ),
	isLiked: get( comment, 'i_like' ),
	postId: get( comment, 'post.ID' ),
	status: get( comment, 'status' ),
	can_moderate: get( comment, 'can_moderate' ),
} );
