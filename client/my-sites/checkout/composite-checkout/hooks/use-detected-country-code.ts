import { useDispatch } from '@wordpress/data';
import debugFactory from 'debug';
import { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getCurrentUserCountryCode } from 'calypso/state/current-user/selectors';

const debug = debugFactory( 'calypso:composite-checkout:use-detected-country-code' );

export default function useDetectedCountryCode(): void {
	const detectedCountryCode = useSelector( getCurrentUserCountryCode );
	const refHaveUsedDetectedCountryCode = useRef( false );
	const { loadCountryCodeFromGeoIP } = useDispatch( 'wpcom-checkout' );

	useEffect( () => {
		// Dispatch exactly once
		if ( detectedCountryCode && ! refHaveUsedDetectedCountryCode.current ) {
			debug( 'using detected country code "' + detectedCountryCode + '"' );
			loadCountryCodeFromGeoIP( detectedCountryCode );
			refHaveUsedDetectedCountryCode.current = true;
		}
	}, [ detectedCountryCode, loadCountryCodeFromGeoIP ] );
}
