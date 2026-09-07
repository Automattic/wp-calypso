/**
 * "Discover new blogs" — Reader Recent-feed module (READ-542).
 *
 * Renders the per-user snapshot of out-of-network post recommendations exported
 * by READ-541 into a bounded, clearly labelled block in the Recent feed.
 *
 * See client/reader/new-blogs/README.md.
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
 * client through the Reader post store (`usePost`) and rendered by the
 * module's own card (see card.tsx).
 */
export interface OonRec {
	blogId: number;
	postId: number;
	score: number;
	/**
	 * TrainTracks railcar for this rec (READ-543). The endpoint should mint
	 * one per rec per response; in mock mode the hook mints it client-side.
	 */
	railcar?: OonRailcar;
}

/**
 * TrainTracks railcar props for one rec. `fetch_algo` identifies the
 * recommender (READ-543: `cluster_rec_v0`); `fetch_position` is the rec's
 * rank in the snapshot, independent of where the card ends up on screen
 * (that's `ui_position`, recorded at render time).
 */
export interface OonRailcar {
	railcar: string;
	fetch_algo: string;
	fetch_position: number;
	rec_blog_id: number;
	rec_post_id: number;
}

/**
 * The serving-table payload for a user: `null`/absent means cold-start — the
 * module must render nothing (never an empty state).
 */
export interface OonRecsSnapshot {
	updated: string;
	recs: OonRec[];
}
