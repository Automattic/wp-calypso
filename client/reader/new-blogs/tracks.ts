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
import type { OonRailcar, OonRec } from './types';

/** Recommender that produced the snapshot (READ-541 / READ-543). */
export const OON_FETCH_ALGO = 'cluster_rec_v0';

/** The surface rendering the recs. */
export const OON_UI_ALGO = 'reader_recent_discover_new_blogs';

/** `action` values for `calypso_traintracks_interact`. */
export const OON_ACTIONS = {
	POST_CLICKED: 'recommended_post_clicked',
	SITE_SUBSCRIBED: 'recommended_site_subscribed',
	SITE_UNSUBSCRIBED: 'recommended_site_unsubscribed',
	SITE_DISMISSED: 'recommended_site_dismissed',
	MODULE_HIDDEN: 'recommended_module_hidden',
	MORE_CLICKED: 'recommended_more_clicked',
} as const;

export type OonAction = ( typeof OON_ACTIONS )[ keyof typeof OON_ACTIONS ];

/**
 * Mint a railcar for a rec that arrived without one (mock mode today; a
 * defensive fallback once the endpoint ships).
 */
export function buildRailcar( rec: OonRec, fetchPosition: number ): OonRailcar {
	return {
		railcar: getNewRailcarId( 'recommendation' ),
		fetch_algo: OON_FETCH_ALGO,
		fetch_position: fetchPosition,
		rec_blog_id: rec.blogId,
		rec_post_id: rec.postId,
	};
}

/** Card impression. Call once per railcar, when the card is on screen. */
export function recordOonRender( rec: OonRec, uiPosition: number ): void {
	if ( ! rec.railcar ) {
		return;
	}
	recordTrainTracksRender( {
		railcarId: rec.railcar.railcar,
		uiAlgo: OON_UI_ALGO,
		uiPosition,
		fetchAlgo: rec.railcar.fetch_algo,
		fetchPosition: rec.railcar.fetch_position,
		recBlogId: String( rec.railcar.rec_blog_id ),
		recPostId: String( rec.railcar.rec_post_id ),
	} );
}

/** User action on a card. */
export function recordOonInteract( rec: OonRec, action: OonAction ): void {
	if ( ! rec.railcar ) {
		return;
	}
	recordTrainTracksInteract( { railcarId: rec.railcar.railcar, action } );
}
