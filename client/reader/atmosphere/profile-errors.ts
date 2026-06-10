import type { AtmosphereError } from '@automattic/api-core';
import type { useTranslate, TranslateResult } from 'i18n-calypso';

/**
 * Map an AtmosphereError kind to a user-facing localised message.
 * Shared between ProfilePanel (your own connection) and AuthorProfilePanel
 * (any author). Per-surface error vocabularies may diverge later; keep this
 * helper exhaustive over the union so TypeScript flags any new kinds.
 */
export function errorMessage(
	error: AtmosphereError,
	translate: ReturnType< typeof useTranslate >
): TranslateResult {
	switch ( error.kind ) {
		case 'auth_failed':
		case 'auth_required':
			return translate( 'Something went wrong with your Bluesky connection.' );
		case 'connection_not_found':
			return translate( 'This Bluesky connection is no longer available.' );
		case 'rate_limited':
			return translate( "Bluesky's asking us to slow down. Try again in a minute." );
		case 'upstream_unavailable':
			return translate( 'Bluesky is unreachable right now.' );
		case 'not_found':
			return translate( 'We couldn’t find that profile.' );
		case 'invalid_handle':
		case 'invalid_credentials':
		case 'bad_request':
		case 'unknown':
			return translate( 'Something went wrong.' );
		default:
			// Soft fallback: a future AtmosphereError variant landing in production
			// before this switch is updated would otherwise crash both panels mid-
			// render (no error boundary on this surface). Surface the gap to
			// devtools and ship the generic copy.
			// eslint-disable-next-line no-console
			console.warn( '[reader-atmosphere] unhandled AtmosphereError kind in errorMessage()', error );
			return translate( 'Something went wrong.' );
	}
}

/**
 * Map an AtmosphereError kind to a follow / unfollow user-facing message.
 * Most kinds are semantically identical to a profile-load failure, so we
 * delegate to the shared `errorMessage`. The exception is `not_found`:
 * the shared copy is profile-load-shaped and would mislead the user when
 * an actor disappears between the page load and the click.
 */
export function followErrorMessage(
	error: AtmosphereError,
	action: 'follow' | 'unfollow',
	translate: ReturnType< typeof useTranslate >
): TranslateResult {
	if ( error.kind === 'not_found' ) {
		return action === 'follow'
			? translate( 'Couldn’t follow this account.' )
			: translate( 'Couldn’t unfollow this account.' );
	}
	return errorMessage( error, translate );
}
