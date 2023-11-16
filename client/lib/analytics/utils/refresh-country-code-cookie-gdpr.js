import cookie from 'cookie';
import debug from './debug';

let refreshRequest = null;

/**
 * Refreshes the GDPR `country_code` cookie every 6 hours (like A8C_Analytics wpcom plugin).
 * @param {AbortSignal} signal optional AbortSignal to cancel the request (use if needed)
 * @returns {Promise<void>} Promise that resolves when the refreshing is done (or immediately)
 */
export default async function refreshCountryCodeCookieGdpr( signal = undefined ) {
	const cookies = cookie.parse( document.cookie );
	if ( cookies.country_code && cookies.region ) {
		debug(
			'refreshCountryCodeCookieGdpr: country_code ( value: "%s") and region ( value: "%s") cookies are fresh',
			cookies.country_code,
			cookies.region
		);
		return;
	}

	if ( refreshRequest === null ) {
		refreshRequest = requestGeoData( signal ).then( ( { countryCode, region } ) => {
			setCountryCodeCookie( countryCode );
			setRegionCookie( region );
		} );
	}

	await refreshRequest;
	refreshRequest = null;
}

function requestGeoData( signal = undefined ) {
	// cache buster
	const v = new Date().getTime();
	return fetch( 'https://public-api.wordpress.com/geo/?v=' + v, { signal } )
		.then( ( res ) => {
			if ( ! res.ok ) {
				return res.body().then( ( body ) => {
					throw new Error( body );
				} );
			}
			return res.json();
		} )
		.then( ( json ) => {
			return { countryCode: json.country_short, region: json.region };
		} )
		.catch( ( err ) => {
			debug( 'refreshCountryCodeCookieGdpr: error: ', err );
			return { countryCode: 'unknown', region: 'unknown' };
		} );
}

function setCountryCodeCookie( countryCode ) {
	const maxAge = 6 * 60 * 60; // 6 hours in seconds
	document.cookie = cookie.serialize( 'country_code', countryCode, { path: '/', maxAge } );
	debug( 'refreshCountryCodeCookieGdpr: country_code cookie set to %s', countryCode );
}

function setRegionCookie( region ) {
	const maxAge = 6 * 60 * 60;
	document.cookie = cookie.serialize( 'region', region, { path: '/', maxAge } );
	debug( 'refreshRegionCookieCcpa: region cookie set to %s', region );
}
