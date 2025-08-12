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
				setCookie( 'country_code', country_short );
				// For some IP ranges we don't detect the region and the value returned by the `/geo` endpoint is `"-"`.
				// In that case set the cookie to `unknown` This cannot happen for `country_short` because the `/geo`
				// endpoint returns a 404 HTTP status when not even the country can be detected.
				setCookie( 'region', region === '-' ? 'unknown' : region );
			} )
			.catch( ( err ) => {
				debug( 'refreshCountryCodeCookieGdpr: error: ', err );
				// Set the cookies to `unknown` to signal that the `/geo` request already failed and there's no point
				// sending it again. But set them only if they don't already exist, don't overwrite valid values!
				if ( ! cookies.country_code ) {
					setCookie( 'country_code', 'unknown' );
				}
				if ( ! cookies.region ) {
					setCookie( 'region', 'unknown' );
				}
			} )
			.finally( () => {
				refreshRequest = null;
			} );
	}

	await refreshRequest;
}

async function requestGeoData( signal = undefined ) {
	// cache buster
	const v = new Date().getTime();
	const res = await fetch( 'https://public-api.wordpress.com/geo/?v=' + v, { signal } );
	if ( ! res.ok ) {
		throw new Error( `The /geo endpoint returned an error: ${ res.status } ${ res.statusText }` );
	}
	return await res.json();
}

function setCookie( name, value ) {
	const maxAge = 6 * 60 * 60; // 6 hours in seconds
	document.cookie = cookie.serialize( name, value, { path: '/', maxAge } );
	debug( 'refreshCountryCodeCookieGdpr: %s cookie set to %s', name, value );
}
