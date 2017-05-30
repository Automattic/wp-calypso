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
