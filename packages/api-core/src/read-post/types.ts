export interface ReadPostBlogKey {
	blogId: number;
	postId: number;
}

export interface ReadPostFeedKey {
	feedId: number;
	postId: number;
	[ key: string ]: unknown;
}

export type ReadPostKey = ReadPostBlogKey | ReadPostFeedKey;

export interface ReadPost {
	ID: number;
	site_ID?: number;
	feed_ID?: number;
	feed_item_ID?: number;
	global_ID: string;
	title?: string;
	site_name?: string;
	excerpt?: string;
	description?: string;
	better_excerpt?: string;
	date?: string;
	URL?: string;
	feed_URL?: string;
	is_seen?: boolean;
	site_icon?: { ico?: string; [ key: string ]: unknown };
	author?: { name?: string; [ key: string ]: unknown };
	canonical_media?: { src?: string; mediaType?: string; [ key: string ]: unknown };
	[ key: string ]: unknown;
}

export const isPostKeyLike = (
	postKey: Partial< ReadPostKey > | null | undefined
): postKey is ReadPostKey =>
	!! postKey &&
	!! postKey.postId &&
	!! ( ( postKey as { blogId?: number } ).blogId || ( postKey as { feedId?: number } ).feedId );
