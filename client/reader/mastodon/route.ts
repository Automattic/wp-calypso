// Mastodon status IDs as projected by the home-instance backend are
// 64-bit snowflake decimals. The thread endpoint validates with the
// same `is_safe_int_id` rule, so accept the same shape here.
export const STATUS_ID_RE = /^[0-9]{1,32}$/;

export function getTimelineUrl( connectionId: number ): string {
	return `/reader/mastodon/${ connectionId }/timeline`;
}

// Builds the in-app thread URL for a Mastodon status. The `statusId` is
// the home-instance status ID — already what `SocialPost.uri` carries
// for Mastodon-mapped items (the mapper sets `uri = item.id`). For
// remote-origin statuses, the home instance still issues a local ID
// when it caches the status via federation, so home-instance IDs work
// universally.
export function getThreadUrl( connectionId: number, statusId: string ): string | null {
	if ( ! Number.isFinite( connectionId ) || connectionId <= 0 ) {
		return null;
	}
	if ( ! STATUS_ID_RE.test( statusId ) ) {
		return null;
	}
	return `/reader/mastodon/${ connectionId }/thread/${ statusId }`;
}

// Webfinger handles arrive in two shapes from upstream Mastodon Account
// blocks: `@user@instance.tld` (already qualified) and `user` (bare local).
// Numeric ids are 1+ digits up to 32 chars (matches our STATUS_ID_RE shape).
const NUMERIC_ID_RE = /^[0-9]{1,32}$/;
const QUALIFIED_HANDLE_RE = /^@[A-Za-z0-9_]+@[A-Za-z0-9.-]+$/;
const BARE_HANDLE_RE = /^@?[A-Za-z0-9_]+$/;

export interface GetProfileUrlOptions {
	// When provided, a bare local handle (`alice`) is qualified to
	// `@alice@<instance>`. Without it, bare handles are rejected so
	// links never produce ambiguous routes.
	instance?: string;
}

// Builds the in-app profile URL for a Mastodon author. Accepts a numeric
// account id (preferred when known — instance-local but stable from the
// connection's perspective) or a webfinger handle (`@user@instance`).
// Returns null on malformed input so callers fall back to the
// home-instance profile URL.
export function getProfileUrl(
	connectionId: number,
	actor: string,
	options: GetProfileUrlOptions = {}
): string | null {
	if ( ! Number.isFinite( connectionId ) || connectionId <= 0 ) {
		return null;
	}
	const trimmed = actor.trim();
	if ( ! trimmed ) {
		return null;
	}
	if ( NUMERIC_ID_RE.test( trimmed ) ) {
		return `/reader/mastodon/${ connectionId }/profile/${ trimmed }`;
	}
	if ( QUALIFIED_HANDLE_RE.test( trimmed ) ) {
		return `/reader/mastodon/${ connectionId }/profile/${ trimmed }`;
	}
	if ( options.instance && BARE_HANDLE_RE.test( trimmed ) ) {
		const username = trimmed.startsWith( '@' ) ? trimmed.slice( 1 ) : trimmed;
		return `/reader/mastodon/${ connectionId }/profile/@${ username }@${ options.instance }`;
	}
	return null;
}
