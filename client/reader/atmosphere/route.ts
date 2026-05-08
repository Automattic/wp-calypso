import { isValidHashtag } from '@automattic/api-core';

export const POST_NSID = 'app.bsky.feed.post';
const DID_WEB_HOST = '[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+';
const DID_BODY = `(?:plc:[a-z2-7]{24}|web:${ DID_WEB_HOST })`;
export const DID_RE = new RegExp( `^did:${ DID_BODY }$` );
export const RKEY_RE = /^[a-z0-9]{13}$/;
export const AT_URI_RE = new RegExp( `^at:\\/\\/(did:${ DID_BODY })\\/([^/]+)\\/([a-z0-9]{13})$` );

export function getTimelineUrl( connectionId: number ): string {
	return `/reader/atmosphere/${ connectionId }/timeline`;
}

/**
 * Build the canonical bsky.app profile URL for a Bluesky handle. Centralised
 * so the four call sites (post-author chip + repost preface fallback,
 * AuthorProfilePanel + ProfilePanel "View on Bluesky" actions) agree on the
 * encoding, and so a future change to bsky.app's URL shape is one edit.
 */
export function getBlueskyProfileUrl( handle: string ): string {
	return `https://bsky.app/profile/${ encodeURIComponent( handle ) }`;
}

export function getThreadUrl( connectionId: number, postUri: string ): string | null {
	if ( ! Number.isFinite( connectionId ) || connectionId <= 0 ) {
		return null;
	}
	const matched = postUri.match( AT_URI_RE );
	if ( ! matched ) {
		return null;
	}
	const [ , did, nsid, rkey ] = matched;
	if ( nsid !== POST_NSID ) {
		return null;
	}
	return `/reader/atmosphere/${ connectionId }/thread/${ did }/${ rkey }`;
}

// Bluesky handles: at least one dot; lowercase ASCII letters/digits/hyphens
// per label; reject leading/trailing dots and uppercase.
export const HANDLE_RE =
	/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/;

export interface ProfileRefInput {
	did?: string | null;
	handle?: string | null;
}

/**
 * Build the in-app author profile URL for a connection. Returns null when
 * neither handle nor DID validates — callers fall back to a bsky.app URL.
 * Handle is preferred over DID for URL readability.
 */
export function getProfileUrl( connectionId: number, ref: ProfileRefInput ): string | null {
	if ( ! Number.isFinite( connectionId ) || connectionId <= 0 ) {
		return null;
	}
	const handle = ref.handle?.trim() ?? '';
	const did = ref.did?.trim() ?? '';

	if ( handle && HANDLE_RE.test( handle ) ) {
		return `/reader/atmosphere/${ connectionId }/profile/${ encodeURIComponent( handle ) }`;
	}
	if ( did && DID_RE.test( did ) ) {
		return `/reader/atmosphere/${ connectionId }/profile/${ encodeURIComponent( did ) }`;
	}
	return null;
}

// Hashtag validator lives in @automattic/api-core so both the route layer
// and the query factory in api-queries share a single regex — preventing
// drift between the controller's validation and the query's `enabled` gate.
export { HASHTAG_RE, isValidHashtag } from '@automattic/api-core';

/**
 * Build the in-app Bluesky tag-feed URL. Lowercases the input, strips a
 * leading `#`, validates the canonical form, and percent-encodes the
 * path segment. Returns `null` for any rejection so callers can fall
 * back to the external bsky.app link.
 */
export function getTagFeedUrl( connectionId: number, hashtag: string ): string | null {
	if ( ! Number.isFinite( connectionId ) || connectionId <= 0 ) {
		return null;
	}
	const canonical = hashtag.trim().toLowerCase().replace( /^#/, '' );
	if ( ! isValidHashtag( canonical ) ) {
		return null;
	}
	return `/reader/atmosphere/${ connectionId }/tag/${ encodeURIComponent( canonical ) }`;
}
