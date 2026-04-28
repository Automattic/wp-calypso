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
			return translate(
				'Your Bluesky connection needs to be re-authorized. Disconnect and reconnect.'
			);
		case 'connection_not_found':
			return translate(
				'Your Bluesky connection is no longer available. Disconnect and reconnect.'
			);
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
