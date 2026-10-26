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
 * Every key the post may already be saved under, starting with
 * `savedKeyForPost()`. A Jetpack post comes back as external while its
 * WordPress.com copy fails to load, so it can be saved under its feed item and
 * shown later with a blog and post ID. Feed item IDs are global, so a match on
 * one is always the same post.
 */
export function savedKeysForPost( post: Post ): ReadSavedKey[] {
	const key = savedKeyForPost( post );
	if ( ! key ) {
		return [];
	}

	return ! post.is_external && post.feed_item_ID
		? [ key, { feed_item_id: post.feed_item_ID } ]
		: [ key ];
}

/**
 * Whether the web app offers to save the post: only when it has the IDs the
 * saved posts API needs.
 */
export function canSavePost( post: Post ): boolean {
	return savedKeyForPost( post ) !== null;
}
