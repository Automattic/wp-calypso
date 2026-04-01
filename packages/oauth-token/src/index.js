import cookie from 'cookie';
import store from 'store';

/**
 * Module variables
 */
const TOKEN_NAME = 'wpcom_token';

// Note: Cookies expect seconds for maxAge, not milliseconds. Leaving this as the existing default behavior for now though.
const MAX_AGE = 365 * 24 * 60 * 60 * 1000; // How long to store the OAuth cookie

export function getToken() {
	const cookies = cookie.parse( document.cookie );

	if ( typeof cookies[ TOKEN_NAME ] !== 'undefined' ) {
		return cookies[ TOKEN_NAME ];
	}

	const token = store.get( TOKEN_NAME );

	if ( token ) {
		return token;
	}

	return false;
}

export function setToken( token, options = {} ) {
	document.cookie = cookie.serialize( TOKEN_NAME, token, { maxAge: MAX_AGE, ...options } );
}

export function clearToken( path ) {
	const cookies = cookie.parse( document.cookie );

	if ( typeof cookies[ TOKEN_NAME ] !== 'undefined' ) {
		document.cookie = cookie.serialize( TOKEN_NAME, '', {
			maxAge: -1,
			...( path ? { path } : {} ),
		} );
	}
}
