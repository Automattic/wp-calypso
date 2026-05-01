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
	[ key: string ]: unknown;
}

export const isPostKeyLike = (
	postKey: Partial< ReadPostKey > | null | undefined
): postKey is ReadPostKey =>
	!! postKey &&
	!! postKey.postId &&
	!! ( ( postKey as { blogId?: number } ).blogId || ( postKey as { feedId?: number } ).feedId );
