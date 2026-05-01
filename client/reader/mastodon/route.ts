// Mastodon status IDs as projected by the home-instance backend are
// 64-bit snowflake decimals. The thread endpoint validates with the
// same `is_safe_int_id` rule, so accept the same shape here.
export const STATUS_ID_RE = /^[0-9]{1,32}$/;

// Acceptable actor shapes:
//   - numeric Mastodon account id (1-32 digits)
//   - bare local handle (`alice`) — caller qualifies with `instance`
//   - webfinger handle (`@alice@instance.tld` or `alice@instance.tld`)
// Username allows ASCII letters, digits, `_`, `-`, `.`. The host part is
// dot-separated DNS labels. The pattern is anchored, single-line, and
// rejects path-traversal characters (`/`, `..`, etc.) by construction.
const ACTOR_USERNAME = '[A-Za-z0-9_-]+(?:\\.[A-Za-z0-9_-]+)*';
const ACTOR_HOST = '[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)+';
export const ACTOR_RE = new RegExp(
	`^(?:${ STATUS_ID_RE.source.slice( 1, -1 ) }|@?${ ACTOR_USERNAME }(?:@${ ACTOR_HOST })?)$`
);

export function isValidActor( actor: string ): boolean {
	return ACTOR_RE.test( actor );
}

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

export interface GetProfileUrlOptions {
	// When provided, a bare local handle (`alice`) is qualified to
	// `@alice@<instance>` so the canonical webfinger form ends up in the URL.
	instance?: string;
}

// Builds the in-app profile URL for a Mastodon author. Accepts whatever
// the call site has on hand: numeric account id, webfinger handle
// (`@user@instance.tld` or `user@instance.tld`), or a bare local handle
// (with `instance` option). Validates against `ACTOR_RE` and percent-
// encodes the segment so a maliciously-shaped `data-id` from a federated
// mention can't pivot the in-app router.
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
	let canonical: string;
	if ( options.instance && ! trimmed.includes( '@' ) ) {
		// Bare local handle (no `@`): qualify with the connection's instance
		// so the URL carries the cross-instance webfinger form.
		canonical = `@${ trimmed }@${ options.instance }`;
	} else {
		canonical = trimmed;
	}
	if ( ! isValidActor( canonical ) ) {
		return null;
	}
	return `/reader/mastodon/${ connectionId }/profile/${ encodeURIComponent( canonical ) }`;
}

// Mastodon hashtags in canonical form: lowercase ASCII + underscore,
// 1-128 chars. The protocol allows a wider Unicode set per joinmastodon.org;
// restrict to the safe ASCII subset for now and revisit if non-ASCII tags
// become a real signal. Anchored, single-line, rejects path-traversal
// characters by construction. Case-strict (lowercase only) so the in-app
// route shape is canonical — a single `/tag/rust` URL, not two distinct
// React-router paths for `Rust` and `rust`.
export const HASHTAG_RE = /^[a-z0-9_]{1,128}$/;

// Validates a hashtag against the canonical form. Callers with raw input
// (mixed case, leading `#`, surrounding whitespace) must canonicalise
// first via `getTagFeedUrl`, which trim/lowercase/strip-`#`s before
// validating.
export function isValidHashtag( hashtag: string ): boolean {
	return HASHTAG_RE.test( hashtag );
}

// Build the in-app hashtag-feed URL. Lowercases the input, strips a
// leading `#`, validates the canonical form, and percent-encodes the
// path segment for safety.
export function getTagFeedUrl( connectionId: number, hashtag: string ): string | null {
	if ( ! Number.isFinite( connectionId ) || connectionId <= 0 ) {
		return null;
	}
	const canonical = hashtag.trim().toLowerCase().replace( /^#/, '' );
	if ( ! isValidHashtag( canonical ) ) {
		return null;
	}
	return `/reader/mastodon/${ connectionId }/tag/${ encodeURIComponent( canonical ) }`;
}
