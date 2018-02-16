/** @format */
export function keyForPost( post ) {
	if ( ! post ) {
		return;
	}

	if ( post.feed_ID && post.feed_item_ID ) {
		return {
			feedId: post.feed_ID,
			postId: post.feed_item_ID,
		};
	}
	if ( post.is_external ) {
		return {
			feedId: post.feed_ID || post.site_ID,
			postId: post.feed_item_ID || post.ID,
		};
	}
	return {
		blogId: post.site_ID,
		postId: post.ID,
	};
}

export function keysAreEqual( a, b ) {
	if ( a === b ) {
		return true;
	}
	if ( ( ! a && b ) || ( a && ! b ) || ( ! a && ! b && a !== b ) ) {
		return false;
	}
	if ( ( a.isGap && ! b.isGap ) || ( ! a.isGap && b.isGap ) ) {
		return false;
	}
	if ( a.isGap && b.isGap ) {
		return a.from === b.from && a.to === b.to;
	}
	if ( a.postId !== b.postId ) {
		return false;
	}
	if ( a.feedId ) {
		return a.feedId === b.feedId;
	}
	return a.blogId === b.blogId;
}

export function keyToString( postKey ) {
	if ( ! postKey || postKey.isGap ) {
		return null;
	}

	if ( postKey.isCombination ) {
		const feedId = postKey.feedId ? `&feedId=${ postKey.feedId }` : '';
		const blogId = postKey.blogId ? `&feedId=${ postKey.blogId }` : '';
		const postIds = postKey.postIds.join( ',' );
		return `postIds=[${ postIds }, ]${ feedId }${ blogId } `;
	} else if ( postKey.isRecommendationBlock ) {
		return `rec-${ postKey.index }`;
	} else if ( postKey.feedId ) {
		return `${ postKey.postId }-${ postKey.feedId }`;
	} else if ( postKey.blogId ) {
		return `${ postKey.postId }-${ postKey.blogId }`;
	}

	return null; // should never happen!
}

export function isPostKeyLike( postKey ) {
	return postKey && postKey.postId && ( postKey.blogId || postKey.feedId );
}
