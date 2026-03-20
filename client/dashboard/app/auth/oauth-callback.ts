import store from 'store';
import { isRelativeUrl } from '../../utils/url';

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

	const accessToken = hash.get( 'access_token' );
	if ( accessToken ) {
		store.set( 'wpcom_token', accessToken );
	}

	const expiresIn = hash.get( 'expires_in' );
	if ( expiresIn ) {
		store.set( 'wpcom_token_expires_in', expiresIn );
	}

	const params = new URLSearchParams( window.location.search );
	const next = params.get( 'next' ) || '/';

	// Validate that next is a safe same-origin relative path to prevent DOM XSS
	// and open redirect via javascript: URIs or absolute URLs to external domains.
	const safeNext = isRelativeUrl( next ) ? next : '/';
	document.location.replace( safeNext );

	return true;
}
