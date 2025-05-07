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
		refreshRequest = requestGeoData( signal )
			.then( ( { country_short, region } ) => {
				setCountryCodeCookie( country_short );
				// For some IP ranges we don't detect the region and the value returned by the `/geo` endpoint is `"-"`.
				// In that case set the cookie to `unknown` This cannot happen for `country_short` because the `/geo`
				// endpoint returns a 404 HTTP status when not even the country can be detected.
				setRegionCookie( region === '-' ? 'unknown' : region );
			} )
			.catch( ( err ) => {
				debug( 'refreshCountryCodeCookieGdpr: error: ', err );
			} )
			.finally( () => {
				refreshRequest = null;
			} );
	}

	await refreshRequest;
}

function requestGeoData( signal = undefined ) {
	// cache buster
	const v = new Date().getTime();
	return fetch( 'https://public-api.wordpress.com/geo/?v=' + v, { signal } ).then( ( res ) => {
		if ( ! res.ok ) {
			return res.body().then( ( body ) => Promise.reject( new Error( body ) ) );
		}
		return res.json();
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
