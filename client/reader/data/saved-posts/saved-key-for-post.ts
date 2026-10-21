import type { ReadSavedKey } from '@automattic/api-core';
import type { Post } from 'calypso/reader/data/post';

/**
 * The key the saved posts API stores a post under: `feed_item_id` for an RSS
 * post, `blog_id` + `post_id` for everything else. Returns `null` when the post
 * is missing the IDs it needs.
 *
 * Don't use `keyForPost()` here: it returns a feed key for any post with a
 * `feed_ID` and `feed_item_ID`, including WordPress.com posts read through
 * Following, so the same post would be saved two ways.
 */
export function savedKeyForPost( post: Post ): ReadSavedKey | null {
	if ( post.is_external ) {
		const feedItemId = post.feed_item_ID || post.ID;
		return feedItemId ? { feed_item_id: feedItemId } : null;
	}

	return post.site_ID && post.ID ? { blog_id: post.site_ID, post_id: post.ID } : null;
}

/**
 * Whether the web app offers to save the post. Not RSS posts yet: `/read/saved`
 * doesn't list them (READ-801).
 */
export function canSavePost( post: Post ): boolean {
	return ! post.is_external && savedKeyForPost( post ) !== null;
}
