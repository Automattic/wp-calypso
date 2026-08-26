import store from 'store';

// Store token into local storage
export function storeToken( context ) {
	// Validate the OAuth state parameter to prevent login CSRF / session fixation.
	const returnedState = context.hash?.state;
	const expectedState = sessionStorage.getItem( 'wpcom_oauth_state' );
	sessionStorage.removeItem( 'wpcom_oauth_state' );
	if ( ! returnedState || ! expectedState || returnedState !== expectedState ) {
		document.location.replace( '/' );
		return;
	}

	if ( context.hash?.access_token ) {
		store.set( 'wpcom_token', context.hash.access_token );
	}

	if ( context.hash?.expires_in ) {
		store.set( 'wpcom_token_expires_in', context.hash.expires_in );
	}

	const { next = '/' } = context.query;

	// Validate that next is a safe relative path to prevent DOM XSS and open redirect.
	const isSafe = next.startsWith( '/' ) && ! next.startsWith( '//' );
	document.location.replace( isSafe ? next : '/' );
}
