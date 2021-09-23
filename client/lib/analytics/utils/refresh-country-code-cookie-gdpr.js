import cookie from 'cookie';
import debug from './debug';

let refreshCountryCodeCookieGdprRequest = null;

/**
 * Refreshes the GDPR `country_code` cookie every 6 hours (like A8C_Analytics wpcom plugin).
 *
 * @returns {Promise<void>} Promise that resolves when the refreshing is done (or immediately)
 */
export default async function refreshCountryCodeCookieGdpr() {
	const cookies = cookie.parse( document.cookie );
	if ( cookies.country_code ) {
		debug( 'refreshCountryCodeCookieGdpr: country_code cookie is fresh: %s', cookies.country_code );
		return;
	}

	if ( refreshCountryCodeCookieGdprRequest === null ) {
		refreshCountryCodeCookieGdprRequest = requestCountryCode().then( ( countryCode ) =>
			setCountryCodeCookie( countryCode )
		);
	}

	await refreshCountryCodeCookieGdprRequest;
	refreshCountryCodeCookieGdprRequest = null;
}

function requestCountryCode() {
	// cache buster
	const v = new Date().getTime();
	return fetch( 'https://public-api.wordpress.com/geo/?v=' + v )
		.then( ( res ) => {
			if ( ! res.ok ) {
				return res.body().then( ( body ) => {
					throw new Error( body );
				} );
			}
			return res.json();
		} )
		.then( ( json ) => {
			return json.country_short;
		} )
		.catch( ( err ) => {
			debug( 'refreshCountryCodeCookieGdpr: error: ', err );
			return 'unknown';
		} );
}

function setCountryCodeCookie( countryCode ) {
	const maxAge = 6 * 60 * 60; // 6 hours in seconds
	document.cookie = cookie.serialize( 'country_code', countryCode, { path: '/', maxAge } );
	debug( 'refreshCountryCodeCookieGdpr: country_code cookie set to %s', countryCode );
}
