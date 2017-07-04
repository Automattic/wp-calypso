/**
 * Internal dependencies
 */
import { Author } from './comment-author'; // eslint-disable-line no-unused-vars
import { CommentInfo } from './comment-info'; // eslint-disable-line no-unused-vars

export function Comment( constructor ) {
	Object.defineProperty( this, 'constructor', {
		value: constructor || this
	} );
}

export function LoadingComment( siteId, commentId ) {
	const comment = new Comment( LoadingComment );

	comment.siteId = siteId;
	comment.commentId = commentId;

	return comment;
}

/**
 * Create a new loaded comment value
 *
 * @param {Number} siteId site id
 * @param {Number} postId post id
 * @param {Number} commentId comment id
 * @param {Author} author comment author
 * @param {CommentInfo} info comment information
 * @returns {Comment} represents a comment with its content
 * @constructor
 */
export function LoadedComment( {
	siteId = 0,
	postId = 0,
	commentId = 0,
	author = null,
	info = null,
} ) {
	const comment = new Comment( LoadedComment );

	comment.siteId = siteId;
	comment.postId = postId;
	comment.commentId = commentId;
	comment.author = author;
	comment.info = info;

	return comment;
}

export default Comment;
