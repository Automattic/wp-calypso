export function keyForPost( post ) {
	if ( post.feed_ID && post.feed_item_ID ) {
		return {
			feedId: post.feed_ID,
			postId: post.feed_item_ID
		};
	}
	if ( post.is_external ) {
		return {
			feedId: post.feed_ID,
			postId: post.ID
		};
	}
	return {
		blogId: post.site_ID,
		postId: post.ID
	};
}

export function keysAreEqual( a, b ) {
	if ( a === b ) {
		return true;
	}
	if ( ( ! a && b ) || ( a && ! b ) ) {
		return false;
	}
	if ( a.postId !== b.postId ) {
		return false;
	}
	if ( a.feedId ) {
		return a.feedId === b.feedId;
	}
	return a.blogId === b.blogId;
}
