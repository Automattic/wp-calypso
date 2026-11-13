import { isRelativeUrl } from '../../utils/url';
import { saveToken } from './token-storage';

export const OAUTH_CALLBACK_PATH = '/oauth/token';

/**
 * Handle the OAuth token callback before React mounts.
 * Must run before AuthProvider, which would otherwise redirect away.
 * Returns true if the callback was handled (caller should return early).
 */
export function handleOAuthCallback(): boolean {
	if ( window.location.pathname !== OAUTH_CALLBACK_PATH ) {
		return false;
	}

	const hash = new URLSearchParams( window.location.hash.substring( 1 ) );
	const params = new URLSearchParams( window.location.search );

	// Validate the OAuth state parameter to prevent login CSRF / session fixation.
	const returnedState = hash.get( 'state' ) || params.get( 'state' );
	const expectedState = sessionStorage.getItem( 'wpcom_oauth_state' );
	sessionStorage.removeItem( 'wpcom_oauth_state' );
	if ( ! returnedState || ! expectedState || returnedState !== expectedState ) {
		window.location.replace( '/' );
		return true;
	}

	const accessToken = hash.get( 'access_token' );
	if ( accessToken ) {
		saveToken( accessToken, hash.get( 'expires_in' ) );
	}

	const next = params.get( 'next' ) || '/';

	// Validate that next is a safe same-origin relative path to prevent DOM XSS
	// and open redirect via javascript: URIs or absolute URLs to external domains.
	const safeNext = isRelativeUrl( next ) ? next : '/';
	window.location.replace( safeNext );

	return true;
}
