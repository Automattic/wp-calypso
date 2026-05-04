import type { MastodonError } from '@automattic/api-core';
import type { useTranslate, TranslateResult } from 'i18n-calypso';

// Map a MastodonError to user-facing localised copy for the profile surface.
// Surface-specific copy diverges from timeline-panel intentionally
// (e.g., "profile" wording instead of "feed").
export function errorMessage(
	error: MastodonError,
	translate: ReturnType< typeof useTranslate >
): TranslateResult {
	switch ( error.kind ) {
		case 'auth_failed':
		case 'auth_required':
			return translate(
				'Your Mastodon connection needs to be re-authorized. Disconnect and reconnect.'
			);
		case 'connection_not_found':
			return translate(
				'Your Mastodon connection is no longer available. Disconnect and reconnect.'
			);
		case 'rate_limited':
			return translate( 'Mastodon is asking us to slow down. Try again in a moment.' );
		case 'upstream_unavailable':
			return translate( 'Mastodon is unreachable right now.' );
		case 'not_found':
			return translate( 'We couldn’t find that profile.' );
		case 'invalid_instance':
		case 'bad_request':
		case 'unknown':
			return translate( 'Something went wrong.' );
		default:
			// Soft fallback: a future MastodonError variant landing in production
			// before this switch is updated would otherwise crash the panel
			// mid-render. Surface the gap to devtools and ship the generic copy.
			// eslint-disable-next-line no-console
			console.warn( '[reader-mastodon] unhandled MastodonError kind in errorMessage()', error );
			return translate( 'Something went wrong.' );
	}
}
