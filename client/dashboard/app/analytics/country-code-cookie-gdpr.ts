import cookie from 'cookie';
import { useEffect, useState } from 'react';
import { fetchGeo } from '../../data/geo';
import { isRegionInCcpaZone } from './geo-privacy';

let refreshRequest: Promise< void > | null = null;

/**
 * Refreshes the GDPR `country_code` cookie every 6 hours (like A8C_Analytics wpcom plugin).
 * @param {AbortSignal} signal optional AbortSignal to cancel the request (use if needed)
 * @returns {Promise<void>} Promise that resolves when the refreshing is done (or immediately)
 */
export async function refreshCountryCodeCookieGdpr( signal?: AbortSignal ) {
	const cookies = cookie.parse( document.cookie );
	if ( cookies.country_code && cookies.region ) {
		return;
	}

	if ( refreshRequest === null ) {
		refreshRequest = fetchGeo( signal )
			.then( ( { country_short, region } ) => {
				setCookie( 'country_code', country_short );
				// For some IP ranges we don't detect the region and the value returned by the `/geo` endpoint is `"-"`.
				// In that case set the cookie to `unknown` This cannot happen for `country_short` because the `/geo`
				// endpoint returns a 404 HTTP status when not even the country can be detected.
				setCookie( 'region', region === '-' ? 'unknown' : region );
			} )
			.catch( () => {
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

function setCookie( name: string, value: string ) {
	const maxAge = 6 * 60 * 60; // 6 hours in seconds
	document.cookie = cookie.serialize( name, value, { path: '/', maxAge } );
}

export function useIsRegionInCcpaZone() {
	const [ isCookieRegionInCcpaZone, setIsCookieRegionInCcpaZone ] = useState( false );

	useEffect( () => {
		const controller = new AbortController();
		refreshCountryCodeCookieGdpr( controller.signal )
			.then( () => {
				const cookies = cookie.parse( document.cookie );
				setIsCookieRegionInCcpaZone( isRegionInCcpaZone( cookies.country_code, cookies.region ) );
			} )
			.catch( () => {
				setIsCookieRegionInCcpaZone( true );
			} );
	}, [] );

	return isCookieRegionInCcpaZone;
}
