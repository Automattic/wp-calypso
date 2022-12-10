import cookie from 'cookie';
import { useEffect, useState } from 'react';
import debug from './debug';

let refreshRequest: ReturnType< typeof refreshGeoCookies > | null = null;

/**
 * Refreshes `country_code` and `region` cookie every 6 hours (like A8C_Analytics wpcom plugin).
 *
 * @param {AbortSignal} signal optional AbortSignal to cancel the request (use if needed)
 * @returns {Promise<void>} Promise that resolves when the refreshing is done (or immediately)
 */
export default async function refreshGeoCookies( signal?: AbortSignal ) {
	const cookies = cookie.parse( document.cookie );
	if ( cookies.country_code && cookies.region ) {
		debug(
			'refreshGeoCookies: country_code ( value: "%s") and region ( value: "%s") cookies are fresh',
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

function requestGeoData( signal?: AbortSignal ) {
	// cache buster
	const v = new Date().getTime();
	return fetch( 'https://public-api.wordpress.com/geo/?v=' + v, { signal } )
		.then( ( res ) => {
			if ( !! res && ! res.ok ) {
				return res.text().then( ( msg ) => {
					throw new Error( msg );
				} );
			}
			return res.json();
		} )
		.then( ( json ) => {
			return { countryCode: json.country_short, region: json.region };
		} )
		.catch( ( err ) => {
			debug( 'refreshGeoCookies: error: ', err );
			return { countryCode: 'unknown', region: 'unknown' };
		} );
}

function setCountryCodeCookie( countryCode: string ) {
	const maxAge = 6 * 60 * 60; // 6 hours in seconds
	document.cookie = cookie.serialize( 'country_code', countryCode, { path: '/', maxAge } );
	debug( 'refreshGeoCookies: country_code cookie set to %s', countryCode );
}

function setRegionCookie( region: string ) {
	const maxAge = 6 * 60 * 60;
	document.cookie = cookie.serialize( 'region', region, { path: '/', maxAge } );
	debug( 'refreshRegionCookieCcpa: region cookie set to %s', region );
}

type GeoCookies = { region: string; countryCode: string };

export const useRefreshGeoCookies = () => {
	const [ geoCookies, setGeoCookies ] = useState< GeoCookies | null >( null );

	useEffect( () => {
		const controller = new AbortController();

		refreshGeoCookies( controller.signal )
			.then( () => {
				const cookies = cookie.parse( document.cookie );
				setGeoCookies( { countryCode: cookies.country_code, region: cookies.region } );
			} )
			.catch( () =>
				setGeoCookies( {
					countryCode: 'unknown',
					region: 'unknown',
				} )
			);

		return () => controller.abort();
	}, [] );

	return geoCookies;
};
