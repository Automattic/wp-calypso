/**
 * "From blogs you don't follow yet" — Discover module (READ-542).
 *
 * Renders the per-user snapshot of out-of-network post recommendations exported
 * by READ-541 into a bounded, clearly labelled block above the Discover feed.
 *
 * See client/reader/discover/new-blogs/README.md.
 */

/**
 * One recommendation, as the serving table stores it (READ-541).
 *
 * Warehouse -> serving-row field mapping:
 *   source_id            -> blogId
 *   item_id              -> postId
 *   recommendation_score -> score
 *   rec_rank (1..200)    -> array order (score desc), truncated to ~50
 *
 * This is all the module needs: each ( blogId, postId ) is hydrated on the
 * client through the Reader post store (`usePost`) and rendered with the shared
 * Reader post card, exactly like a Discover stream item.
 */
export interface OonRec {
	blogId: number;
	postId: number;
	score: number;
}

/**
 * The serving-table payload for a user: `null`/absent means cold-start — the
 * module must render nothing (never an empty state).
 */
export interface OonRecsSnapshot {
	updated: string;
	recs: OonRec[];
}
