import type { AtmosphereError } from '@automattic/api-core';
import type { SocialError } from 'calypso/reader/social';

/**
 * Project an AtmosphereError onto the SocialError shape consumed by
 * SocialFeedList's empty-state vocabulary. SocialError covers the union of
 * kinds Mastodon and Bluesky surface; collapse atmosphere-only kinds onto
 * the closest semantic match (e.g. invalid_handle → unknown with cause).
 *
 * Shared between TimelinePanel and AuthorProfilePanel so both surfaces
 * report identical error UX for identical upstream conditions.
 */
export function projectAtmosphereError(
	err: AtmosphereError | null | undefined
): SocialError | null {
	if ( ! err ) {
		return null;
	}
	switch ( err.kind ) {
		case 'auth_required':
		case 'not_found':
		case 'upstream_unavailable':
			return { kind: err.kind };
		case 'auth_failed':
		case 'invalid_credentials':
			// Stale credentials — same recovery as auth_required.
			return { kind: 'auth_required' };
		case 'connection_not_found':
			// User-side connection deleted — semantically a not_found.
			return { kind: 'not_found' };
		case 'rate_limited':
			return err.retry_after !== undefined
				? { kind: 'rate_limited', retry_after: err.retry_after }
				: { kind: 'rate_limited' };
		case 'bad_request':
			// Surface the backend's validation message — collapsing to a generic
			// "Something went wrong" copy hides actionable detail (e.g. "Hashtag
			// too long" or "Invalid handle"). Mirrors the Mastodon projector.
			return { kind: 'unknown', cause: err, message: err.message ?? undefined };
		case 'invalid_handle':
		case 'unknown':
			return { kind: 'unknown', cause: err };
		default:
			// Soft fallback: a future AtmosphereError variant landing in
			// production before this switch is updated would otherwise crash
			// the panel mid-render. Surface the gap to devtools and ship the
			// generic copy. Mirrors the Mastodon projector.
			// eslint-disable-next-line no-console
			console.warn(
				'[reader-atmosphere] unhandled AtmosphereError kind in projectAtmosphereError()',
				err
			);
			return { kind: 'unknown', cause: err };
	}
}
