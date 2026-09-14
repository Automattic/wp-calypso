import type { MastodonError } from '@automattic/api-core';
import type { SocialError } from 'calypso/reader/social';

// Project a MastodonError onto the SocialError shape SocialFeedList consumes.
// Shared between TimelinePanel and the profile surface so both report
// identical error UX for identical upstream conditions.
export function projectMastodonError( err: MastodonError | null | undefined ): SocialError | null {
	if ( ! err ) {
		return null;
	}
	switch ( err.kind ) {
		case 'auth_required':
		case 'not_found':
		case 'upstream_unavailable':
			return { kind: err.kind };
		case 'auth_failed':
			return { kind: 'auth_required' };
		case 'connection_not_found':
			return { kind: 'not_found' };
		case 'rate_limited':
			return err.retry_after !== undefined
				? { kind: 'rate_limited', retry_after: err.retry_after }
				: { kind: 'rate_limited' };
		case 'bad_request':
			// Surface the backend's validation message — collapsing to a generic
			// "Something went wrong" copy hides actionable detail (e.g. "Invalid
			// instance: example.invalid").
			return { kind: 'unknown', cause: err, message: err.message };
		case 'invalid_instance':
			// `invalid_instance` is a discriminator-only variant on the wire;
			// no message is shipped, so let FeedListEmpty fall back to its
			// generic copy.
			return { kind: 'unknown', cause: err };
		case 'unknown':
			return { kind: 'unknown', cause: err };
		default:
			// Soft fallback: a future MastodonError variant landing in production
			// before this switch is updated would otherwise crash the panel
			// mid-render. Surface the gap to devtools and ship the generic copy.
			// eslint-disable-next-line no-console
			console.warn(
				'[reader-mastodon] unhandled MastodonError kind in projectMastodonError()',
				err
			);
			return { kind: 'unknown', cause: err };
	}
}
