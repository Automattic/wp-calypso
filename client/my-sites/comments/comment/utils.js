/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Create a stripped down comment object containing only the information needed by
 * CommentList's change status and reply functions, and their respective undos.
 *
 * @param {Object} comment A comment object.
 * @returns {Object} A stripped down comment object.
 */
export const getMinimalComment = comment => ( {
	commentId: get( comment, 'ID' ),
	isLiked: get( comment, 'i_like' ),
	postId: get( comment, 'post.ID' ),
	status: get( comment, 'status' ),
} );
