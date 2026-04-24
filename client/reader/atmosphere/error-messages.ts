import type { AtmosphereError } from '@automattic/api-core';
import type { useTranslate, TranslateResult } from 'i18n-calypso';

export function atmosphereErrorMessage(
	error: AtmosphereError,
	translate: ReturnType< typeof useTranslate >
): TranslateResult {
	switch ( error.kind ) {
		case 'invalid_handle':
			return translate( "That doesn't look like a valid Bluesky handle." );
		case 'invalid_credentials':
			return translate( 'Wrong handle or app password. Double-check and try again.' );
		case 'auth_failed':
			return translate(
				'Your Bluesky connection needs to be re-authorized. Disconnect and reconnect.'
			);
		case 'connection_not_found':
			return translate( 'That connection is no longer available.' );
		case 'rate_limited':
			return translate( "Bluesky's asking us to slow down. Try again in a minute." );
		case 'upstream_unavailable':
			return translate( 'Bluesky is unreachable right now.' );
		case 'bad_request':
		case 'unknown':
			return translate( 'Something went wrong.' );
		default:
			return assertNever( error );
	}
}

function assertNever( value: never ): never {
	throw new Error( `Unhandled AtmosphereError kind: ${ JSON.stringify( value ) }` );
}
