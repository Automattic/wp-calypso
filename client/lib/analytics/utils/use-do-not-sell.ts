import { recordTracksEvent } from '@automattic/calypso-analytics';
import cookie from 'cookie';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { saveUserSettings } from 'calypso/state/user-settings/actions';
import isRegionInCcpaZone from './is-region-in-ccpa-zone';
import { getTrackingPrefs, refreshCountryCodeCookieGdpr, setTrackingPrefs } from '.';

export default () => {
	const [ shouldSeeDoNotSell, setShouldSeeDoNotSell ] = useState( false );
	const [ isDoNotSell, setIsDoNotSell ] = useState( false );
	const dispatch = useDispatch();

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

	const setUserAdvertisingOptOut = useCallback(
		( isOptedOut: boolean ) => {
			dispatch( saveUserSettings( { advertising_targeting_opt_out: isOptedOut } ) );
		},
		[ saveUserSettings ]
	);

	const onSetDoNotSell = useCallback(
		( isActive: boolean ) => {
			// Update the preferences in the cookie
			// isActive = true means user has opted out of "advertising" tracking
			const prefs = setTrackingPrefs( { ok: true, buckets: { advertising: ! isActive } } );

			if ( isActive ) {
				recordTracksEvent( 'a8c_ccpa_optout', {
					source: 'calypso',
					hostname: window.location.hostname,
					pathname: window.location.pathname,
				} );
			}

			setUserAdvertisingOptOut( isActive );
			setIsDoNotSell( ! prefs.buckets.advertising );
		},
		[ setIsDoNotSell ]
	);

	return { shouldSeeDoNotSell, onSetDoNotSell, setUserAdvertisingOptOut, isDoNotSell };
};
