/**
 * "Discover new blogs" (READ-542): the caller's out-of-network post
 * recommendations from the `reader_oon_recs` snapshot (READ-541).
 */

/** One rec as the API sends it. */
export interface ReadNewBlogsApiRec {
	blog_id: number;
	post_id: number;
	score: number;
}

export interface ReadNewBlogsApiResponse {
	/** Snapshot timestamp, or null for cold-start. */
	updated: string | null;
	/** Best-first. Empty means cold-start or nothing survived the serve-time guard. */
	recs: ReadNewBlogsApiRec[];
}

/** One rec in client shape. */
export interface ReadNewBlogsRec {
	blogId: number;
	postId: number;
	score: number;
}

export interface ReadNewBlogs {
	updated: string | null;
	recs: ReadNewBlogsRec[];
}
