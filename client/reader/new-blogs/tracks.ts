/**
 * TrainTracks instrumentation for the "Discover new blogs" module (READ-543).
 *
 * One `calypso_traintracks_render` per card impression (fired when the card is
 * actually on screen, once per railcar), and one `calypso_traintracks_interact`
 * per user action on a card. Together with the existing
 * `calypso_reader_discover_new_blogs_*` Tracks events this gives the A/B
 * readout both engagement (click, follow) and annoyance (dismiss, hide).
 *
 * Mirrors the sidebar's Recommended sites card (reader/recommended-sites/site).
 */
import {
	getNewRailcarId,
	recordTrainTracksInteract,
	recordTrainTracksRender,
} from '@automattic/calypso-analytics';
import type { ReadNewBlogsRec } from '@automattic/api-core';

/** Recommender that produced the snapshot (READ-541 / READ-543). */
export const NEW_BLOGS_FETCH_ALGO = 'cluster_rec_v0';

/** The surface rendering the recs. */
export const NEW_BLOGS_UI_ALGO = 'reader_recent_discover_new_blogs';

/** `action` values for `calypso_traintracks_interact`. */
export const NEW_BLOGS_ACTIONS = {
	POST_CLICKED: 'recommended_post_clicked',
	SITE_SUBSCRIBED: 'recommended_site_subscribed',
	SITE_UNSUBSCRIBED: 'recommended_site_unsubscribed',
	SITE_DISMISSED: 'recommended_site_dismissed',
	MODULE_HIDDEN: 'recommended_module_hidden',
	MORE_CLICKED: 'recommended_more_clicked',
} as const;

export type NewBlogsAction = ( typeof NEW_BLOGS_ACTIONS )[ keyof typeof NEW_BLOGS_ACTIONS ];

/**
 * TrainTracks railcar props for one rec. `fetch_algo` identifies the
 * recommender; `fetch_position` is the rec's 1-based rank in the snapshot,
 * independent of where the card ends up on screen (that's `ui_position`,
 * recorded at render time).
 */
export interface NewBlogRailcar {
	railcar: string;
	fetch_algo: string;
	fetch_position: number;
	rec_blog_id: number;
	rec_post_id: number;
}

/** A rec as the module renders it: the API rec plus its railcar. */
export type NewBlogRec = ReadNewBlogsRec & { railcar: NewBlogRailcar };

/**
 * Mint a railcar for a rec. The endpoint doesn't send railcars, so the data
 * hook mints one per rec per snapshot and every event for a card shares it.
 */
export function buildRailcar( rec: ReadNewBlogsRec, fetchPosition: number ): NewBlogRailcar {
	return {
		railcar: getNewRailcarId( 'recommendation' ),
		fetch_algo: NEW_BLOGS_FETCH_ALGO,
		fetch_position: fetchPosition,
		rec_blog_id: rec.blogId,
		rec_post_id: rec.postId,
	};
}

/** Card impression. Call once per railcar, when the card is on screen. */
export function recordNewBlogRender( rec: NewBlogRec, uiPosition: number ): void {
	recordTrainTracksRender( {
		railcarId: rec.railcar.railcar,
		uiAlgo: NEW_BLOGS_UI_ALGO,
		uiPosition,
		fetchAlgo: rec.railcar.fetch_algo,
		fetchPosition: rec.railcar.fetch_position,
		recBlogId: String( rec.railcar.rec_blog_id ),
		recPostId: String( rec.railcar.rec_post_id ),
	} );
}

/** User action on a card. */
export function recordNewBlogInteract( rec: NewBlogRec, action: NewBlogsAction ): void {
	recordTrainTracksInteract( { railcarId: rec.railcar.railcar, action } );
}
