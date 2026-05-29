// Bluesky hashtag canonical form: Unicode letters/numbers/marks/underscore,
// 1-64 chars. The 64-char cap matches Bluesky's tag-length limit (64
// graphemes — chars ≈ graphemes for the common case). Anchored,
// single-line, lowercase-strict so the in-app route shape is canonical.
//
// The frontend regex mirrors the wpcom backend's hashtag validator —
// keep them in sync. Tags that fail validation fall through to bsky.app
// via the click-handler in post-card-body, so the regex is the safe-set
// guarantee, not a strict spec match.
export const HASHTAG_RE = /^[\p{L}\p{N}\p{M}_]{1,64}$/u;

export function isValidHashtag( hashtag: string ): boolean {
	return HASHTAG_RE.test( hashtag );
}
