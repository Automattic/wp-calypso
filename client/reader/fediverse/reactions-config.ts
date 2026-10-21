import type { PostCardReactionsConfig } from 'calypso/reader/social';

/**
 * Per-action gate for the Reader's Fediverse post cards (CM-771).
 *
 * The per-protocol write endpoints (Like / Announce / Reply) aren't in
 * the ActivityPub plugin yet — backend + frontend slices are tracked
 * separately (CM-763 / CM-764, CM-765 / CM-766, CM-769 / CM-770). The
 * public release on 2026-05-25 ships reads + basic writes (compose) only;
 * hiding the matching affordances here keeps the surface honest until
 * each write path lands end-to-end.
 *
 * Flip a key to `true` per protocol as its slice ships:
 *  - `like`     → flip when CM-764 (Like frontend) lands.
 *  - `repost`   → flip when CM-766 (Announce frontend) lands.
 *  - `reply`    → flip when CM-770 (Reply composer) lands.
 *
 * Module-level constant so every Fediverse render-site passes the same
 * reference identity; avoids unnecessary cache rebuilds inside the
 * post-card render callback when this object is threaded through a
 * `useCallback` dep list.
 */
export const FEDIVERSE_REACTIONS: PostCardReactionsConfig = Object.freeze( {
	like: false,
	repost: false,
	reply: false,
} );
