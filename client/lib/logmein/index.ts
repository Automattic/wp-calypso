/**
 * Internal Dependencies
 */
import { isEnabled } from '@automattic/calypso-config';

/**
 * Append logmein=1 query parameter to mapped domain urls we want the user to be logged in against.
 */

// Used as placeholder / default domain to detect when we're looking at a relative url
const INVALID_URL = `http://__domain__.invalid`;

export function logmeinUrl( url: string, allow: string[], isWPComLoggedIn = true ): string {
	let newurl: URL;

	if ( ! isEnabled( 'logmein' ) ) {
		return url;
	}

	try {
		newurl = new URL( String( url ), INVALID_URL );
	} catch ( e ) {
		// Ignore unparseable urls
		return url;
	}

	// Ignore and passthrough /relative/urls that have no host specified
	if ( newurl.origin === INVALID_URL ) {
		return url;
	}

	// Ignore urls not in the allow list
	allow = allow.map( ( allowed ) => new URL( String( allowed ), INVALID_URL ).hostname );
	if ( allow.indexOf( newurl.hostname ) === -1 ) {
		return url;
	}

	// logmein doesn't work with http.
	newurl.protocol = 'https:';

	// we're already logged into wordpress.com so we can take a shortcut
	if ( isWPComLoggedIn ) {
		newurl.searchParams.set( 'logmein', 'direct' );
	} else {
		newurl.searchParams.set( 'logmein', '1' );
	}
	return newurl.toString();
}
