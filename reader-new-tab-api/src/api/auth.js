const CLIENT_ID = '137246';
const REDIRECT_URI = 'https://bpobocnnmpaelfgjoclhafalohdlchdp.chromiumapp.org/';
const AUTH_URL = `https://public-api.wordpress.com/oauth2/authorize?client_id=${ CLIENT_ID }&redirect_uri=${ encodeURIComponent(
	REDIRECT_URI
) }&response_type=token&scope=global`;
const TOKEN_KEY = 'wpcom_oauth_token';

export async function getStoredToken() {
	return new Promise( ( resolve ) => {
		chrome.storage.local.get( TOKEN_KEY, ( result ) => {
			resolve( result[ TOKEN_KEY ] || null );
		} );
	} );
}

function storeToken( token ) {
	return new Promise( ( resolve ) => {
		chrome.storage.local.set( { [ TOKEN_KEY ]: token }, resolve );
	} );
}

export function removeToken() {
	return new Promise( ( resolve ) => {
		chrome.storage.local.remove( TOKEN_KEY, resolve );
	} );
}

export async function login() {
	return new Promise( ( resolve, reject ) => {
		chrome.identity.launchWebAuthFlow( { url: AUTH_URL, interactive: true }, ( redirectUrl ) => {
			if ( chrome.runtime.lastError ) {
				reject( new Error( chrome.runtime.lastError.message ) );
				return;
			}
			const url = new URL( redirectUrl );
			const hash = url.hash.substring( 1 );
			const params = new URLSearchParams( hash );
			const accessToken = params.get( 'access_token' );
			if ( ! accessToken ) {
				reject( new Error( 'No access token in response' ) );
				return;
			}
			storeToken( accessToken ).then( () => resolve( accessToken ) );
		} );
	} );
}
