/**
 * Internal dependencies
 */
import store from 'store';

// Store token into local storage
export function storeToken( context ) {
	if ( context.hash?.access_token ) {
		store.set( 'wpcom_token', context.hash.access_token );
	}

	if ( context.hash?.expires_in ) {
		store.set( 'wpcom_token_expires_in', context.hash.expires_in );
	}

	const { next = '/' } = context.query;
	document.location.replace( next );
}
