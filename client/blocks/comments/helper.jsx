export function shouldShowComments( post ) {
	if ( post.discussion && ( post.discussion.comments_open || post.discussion.comment_count > 0 ) ) {
		return true;
	}

	return false;
}
