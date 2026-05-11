import type { FediverseError } from '@automattic/api-core';
import type { useTranslate, TranslateResult } from 'i18n-calypso';

/**
 * Per-action follow / unfollow error copy. Most error kinds share the
 * profile-load copy because they're rooted in the same backend issue
 * (auth, rate-limit, transport), so we delegate to the shared
 * `errorMessage`. The exception is `not_found`: the shared copy is
 * profile-load-shaped ("We couldn't find that profile.") and would
 * mislead the user when an actor disappears between profile load and
 * the follow click. Shared between the followers / following list views
 * and any future author-profile follow surface. Mirrors the Mastodon
 * `followErrorMessage`.
 */
export function followErrorMessage(
	error: FediverseError,
	action: 'follow' | 'unfollow',
	translate: ReturnType< typeof useTranslate >
): TranslateResult {
	if ( error.kind === 'not_found' ) {
		switch ( action ) {
			case 'follow':
				return translate( 'Couldn’t follow this account.' );
			case 'unfollow':
				return translate( 'Couldn’t unfollow this account.' );
			default: {
				// Compile-time exhaustiveness guard plus a soft runtime fallback.
				// A future action variant landing in production before this
				// switch is updated would otherwise surface the profile-load
				// `not_found` copy, which misleads on a follow-shaped click.
				const _exhaustive: never = action;
				void _exhaustive;
				// eslint-disable-next-line no-console
				console.warn(
					'[reader-fediverse] unhandled follow action in followErrorMessage()',
					action
				);
				return translate( 'Couldn’t update this account.' );
			}
		}
	}
	return errorMessage( error, translate );
}

// Map a FediverseError to user-facing localised copy for the profile surface.
// Surface-specific copy diverges from timeline-panel intentionally
// (e.g., "profile" wording instead of "feed").
export function errorMessage(
	error: FediverseError,
	translate: ReturnType< typeof useTranslate >
): TranslateResult {
	switch ( error.kind ) {
		case 'auth_required':
			return translate(
				'Your Fediverse connection needs to be re-authorized. Disconnect and reconnect.'
			);
		case 'connection_not_found':
			return translate(
				'Your Fediverse connection is no longer available. Disconnect and reconnect.'
			);
		case 'rate_limited':
			return translate( 'The Fediverse is asking us to slow down. Try again in a moment.' );
		case 'upstream_unavailable':
			return translate( 'The Fediverse is unreachable right now.' );
		case 'not_found':
			return translate( 'We couldn’t find that profile.' );
		case 'unknown':
			return translate( 'Something went wrong.' );
		default:
			// Soft fallback: a future FediverseError variant landing in production
			// before this switch is updated would otherwise crash the panel
			// mid-render. Surface the gap to devtools and ship the generic copy.
			// eslint-disable-next-line no-console
			console.warn( '[reader-fediverse] unhandled FediverseError kind in errorMessage()', error );
			return translate( 'Something went wrong.' );
	}
}
