import type { FediverseError } from '@automattic/api-core';
import type { SocialError } from 'calypso/reader/social';

/**
 * Project a `FediverseError` onto the `SocialError` shape that
 * `SocialFeedList` consumes. Shared between TimelinePanel and the
 * profile surface so both report identical error UX for identical
 * upstream conditions. Mirrors `projectMastodonError`.
 */
export function projectFediverseError(
	err: FediverseError | null | undefined
): SocialError | null {
	if ( ! err ) {
		return null;
	}
	switch ( err.kind ) {
		case 'auth_required':
		case 'not_found':
		case 'upstream_unavailable':
			return { kind: err.kind };
		case 'connection_not_found':
			return { kind: 'not_found' };
		case 'rate_limited':
			return err.retry_after !== undefined
				? { kind: 'rate_limited', retry_after: err.retry_after }
				: { kind: 'rate_limited' };
		case 'unknown':
			return { kind: 'unknown', cause: err };
		default:
			// Soft fallback: a future FediverseError variant landing in
			// production before this switch is updated would otherwise crash
			// the panel mid-render. Surface the gap to devtools and ship the
			// generic copy.
			// eslint-disable-next-line no-console
			console.warn(
				'[reader-fediverse] unhandled FediverseError kind in projectFediverseError()',
				err
			);
			return { kind: 'unknown', cause: err };
	}
}
