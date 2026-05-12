// Sole reader of `post.global_ID`. Use this everywhere instead of touching
// the snake_case field directly so the camelCase `globalId` on `PostKey`
// stays the only spelling that leaks out into the rest of the code.
export function getGlobalId( post ) {
	return post?.global_ID || post?.globalId || undefined;
}

export function keyForPost( post ) {
	if ( ! post ) {
		return;
	}

	const gid = getGlobalId( post );
	const globalId = gid ? { globalId: gid } : null;

	if ( post.feed_ID && post.feed_item_ID ) {
		return {
			feedId: post.feed_ID,
			postId: post.feed_item_ID,
			...globalId,
		};
	}
	if ( post.is_external ) {
		return {
			feedId: post.feed_ID || post.site_ID,
			postId: post.feed_item_ID || post.ID,
			...globalId,
		};
	}
	return {
		blogId: post.site_ID,
		postId: post.ID,
		...globalId,
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

	if ( postKey.isRecommendationBlock ) {
		return `rec-${ postKey.index }`;
	} else if ( postKey.isPromptBlock ) {
		return `prompt-${ postKey.index }`;
	} else if ( postKey.feedId ) {
		return `feed-${ postKey.postId }-${ postKey.feedId }`;
	} else if ( postKey.blogId ) {
		return `blog-${ postKey.postId }-${ postKey.blogId }`;
	}

	return null; // should never happen!
}

export { isPostKeyLike } from '@automattic/api-core';
