/**
 * Mock OON recs — same shape as the serving table (READ-541) and the future
 * endpoint: { blogId, postId, score } only. Display data is NOT mocked; the
 * module hydrates each pair through the real Reader post store, so these must
 * be real, public WordPress.com posts or the card will not render.
 *
 * Keyed by user id, as the serving table is. Users NOT in this map are
 * cold-start: the module renders nothing for them.
 *
 * `MOCK_DEFAULT_USER_ID` is what `useOonRecs()` falls back to in mock mode when
 * the current user id isn't in the map — so the module is demo-able as any
 * logged-in user. Set it to a user id present below.
 */
import type { OonRecsSnapshot } from './types';

export const MOCK_DEFAULT_USER_ID = 23314024;

// Real public posts, so `usePost( { blogId, postId } )` resolves, on blogs whose
// site icons resolve too. One post per blog in the healthy list, so dismissing
// a blog ("not interested") removes exactly one card.
const JETPACK = 256526497; // jetpack.com
const LONGREADS = 70135762; // longreads.com
const AUTOMATTIC = 54117; // automattic.com
const AKISMET = 209054374; // akismet.com
const WPVIP = 2235322; // wpvip.com
const SIMPLENOTE = 43752875; // simplenote.com
const POCKET_CASTS = 198489407; // blog.pocketcasts.com
const DAY_ONE = 196615358; // dayoneapp.com

export const MOCK_OON_RECS: Record< number, OonRecsSnapshot > = {
	// Healthy list: 8 recs from 8 different blogs (two pages of 3 + a page of 2).
	23314024: {
		updated: '2026-08-31T00:00:00Z',
		recs: [
			{ blogId: JETPACK, postId: 526397, score: 0.018734 },
			{ blogId: LONGREADS, postId: 159152, score: 0.017022 },
			{ blogId: AUTOMATTIC, postId: 930553, score: 0.015901 },
			{ blogId: AKISMET, postId: 284827, score: 0.014277 },
			{ blogId: SIMPLENOTE, postId: 425809, score: 0.01264 },
			{ blogId: POCKET_CASTS, postId: 9733, score: 0.011884 },
			{ blogId: DAY_ONE, postId: 153431, score: 0.010502 },
			{ blogId: WPVIP, postId: 33781, score: 0.009913 },
		],
	},
	// Only three recs — exactly one page, so "More like this" is hidden.
	111: {
		updated: '2026-08-31T00:00:00Z',
		recs: [
			{ blogId: LONGREADS, postId: 159152, score: 0.00912 },
			{ blogId: JETPACK, postId: 524894, score: 0.00605 },
			{ blogId: SIMPLENOTE, postId: 425766, score: 0.0039 },
		],
	},
	// Deleted / non-existent post ids: exercises the serve-time guard — the
	// post store returns an error post and the card renders nothing.
	222: {
		updated: '2026-08-31T00:00:00Z',
		recs: [
			{ blogId: JETPACK, postId: 999999999, score: 0.00912 },
			{ blogId: LONGREADS, postId: 159152, score: 0.00605 },
		],
	},
	// Present key, empty list -> treated as cold-start (module hidden).
	999: {
		updated: '2026-08-31T00:00:00Z',
		recs: [],
	},
};
