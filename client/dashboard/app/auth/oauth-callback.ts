import store from 'store';

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
		document.location.replace( '/' );
		return true;
	}

	const accessToken = hash.get( 'access_token' );
	if ( accessToken ) {
		store.set( 'wpcom_token', accessToken );
	}

	const expiresIn = hash.get( 'expires_in' );
	if ( expiresIn ) {
		store.set( 'wpcom_token_expires_in', expiresIn );
	}

	const next = params.get( 'next' ) || '/';
	document.location.replace( next );

	return true;
}
