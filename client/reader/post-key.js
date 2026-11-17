/**
 * Whether the post is a snapshot the saved posts API built for a save it can't
 * load as a Reader post: a page saved by URL, or a feed item that's since been
 * deleted. Snapshots have no site or feed, so render them from the stream data.
 */
export function isSavedSnapshotPost( post ) {
	return Boolean( post?.is_external && post.site_ID === 0 && post.feed_ID === 0 );
}

export function keyForPost( post ) {
	if ( ! post ) {
		return;
	}

	if ( isSavedSnapshotPost( post ) ) {
		return {
			snapshotId: post.global_ID || post.URL,
			url: post.URL,
		};
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
	if ( a.snapshotId || b.snapshotId ) {
		return a.snapshotId === b.snapshotId;
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
	} else if ( postKey.isCustomBlock ) {
		return `custom-${ postKey.index }`;
	} else if ( postKey.snapshotId ) {
		return `snapshot-${ postKey.snapshotId }`;
	} else if ( postKey.feedId ) {
		return `feed-${ postKey.postId }-${ postKey.feedId }`;
	} else if ( postKey.blogId ) {
		return `blog-${ postKey.postId }-${ postKey.blogId }`;
	}

	return null; // should never happen!
}

export { isPostKeyLike } from '@automattic/api-core';
