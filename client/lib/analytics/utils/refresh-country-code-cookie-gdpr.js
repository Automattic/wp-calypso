/**
 * External dependencies
 */
import cookie from 'cookie';

/**
 * Internal dependencies
 */
import debug from './debug';

/**
 * Refreshes the GDPR `country_code` cookie every 6 hours (like A8C_Analytics wpcom plugin).
 * @returns {Promise<void>} Promise that resolves when the refreshing is done (or immediately)
 */
export default async function refreshCountryCodeCookieGdpr() {
	const cookies = cookie.parse( document.cookie );
	if ( cookies.country_code ) {
		debug( 'refreshCountryCodeCookieGdpr: country_code cookie is fresh: %s', cookies.country_code );
		return;
	}

	try {
		// cache buster
		const v = new Date().getTime();
		const res = await fetch( 'https://public-api.wordpress.com/geo/?v=' + v );
		if ( ! res.ok ) {
			throw new Error( await res.body() );
		}

		const json = await res.json();
		setCountryCodeCookie( json.country_short );
	} catch ( err ) {
		debug( 'refreshCountryCodeCookieGdpr: error: ', err );
		setCountryCodeCookie( 'unknown' );
	}
}

function setCountryCodeCookie( countryCode ) {
	const maxAge = 6 * 60 * 60; // 6 hours in seconds
	document.cookie = cookie.serialize( 'country_code', countryCode, { path: '/', maxAge } );
	debug( 'refreshCountryCodeCookieGdpr: country_code cookie set to %s', countryCode );
}
