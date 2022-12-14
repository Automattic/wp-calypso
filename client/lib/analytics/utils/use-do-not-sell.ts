import cookie from 'cookie';
import { useCallback, useEffect, useState } from 'react';
import isRegionInCcpaZone from './is-region-in-ccpa-zone';
import { getTrackingPrefs, refreshCountryCodeCookieGdpr, setTrackingPrefs } from '.';

export default () => {
	const [ shouldSeeDoNotSell, setShouldSeeDoNotSell ] = useState( false );
	const [ isDoNotSell, setIsDoNotSell ] = useState( false );

	useEffect( () => {
		const controller = new AbortController();

		refreshCountryCodeCookieGdpr( controller.signal )
			.then( () => {
				const cookies = cookie.parse( document.cookie );

				setShouldSeeDoNotSell( isRegionInCcpaZone( cookies.country_code, cookies.region ) );
			} )
			.catch( () => {
				// Fail safe: in case of error, we offer Do Not Sell anyway
				setShouldSeeDoNotSell( true );
			} );

		return () => controller.abort();
	}, [ setShouldSeeDoNotSell ] );

	useEffect( () => {
		// We set initial `isDoNotSell` via hook to make sure it run only on client side (when SSR)
		setIsDoNotSell( ! getTrackingPrefs().buckets.advertising );
	}, [] );

	const onSetDoNotSell = useCallback(
		( isActive: boolean ) => {
			// isActive = true means user has opted out of "advertising" tracking
			const prefs = setTrackingPrefs( { ok: true, buckets: { advertising: ! isActive } } );
			setIsDoNotSell( ! prefs.buckets.advertising );
		},
		[ setIsDoNotSell ]
	);

	return { shouldSeeDoNotSell, onSetDoNotSell, isDoNotSell };
};
