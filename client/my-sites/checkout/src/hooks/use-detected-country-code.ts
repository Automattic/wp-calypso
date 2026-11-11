import debugFactory from 'debug';
import { useRef, useEffect } from 'react';
import { useSelector } from 'calypso/state';
import { getCurrentUserCountryCode } from 'calypso/state/current-user/selectors';
import { contactDetailsActions } from '../lib/checkout-stores';

const debug = debugFactory( 'calypso:composite-checkout:use-detected-country-code' );

export default function useDetectedCountryCode(): void {
	const detectedCountryCode = useSelector( getCurrentUserCountryCode );
	const refHaveUsedDetectedCountryCode = useRef( false );

	useEffect( () => {
		// Dispatch exactly once
		if ( detectedCountryCode && ! refHaveUsedDetectedCountryCode.current ) {
			debug( 'using detected country code "' + detectedCountryCode + '"' );
			contactDetailsActions.loadCountryCodeFromGeoIP( detectedCountryCode );
			refHaveUsedDetectedCountryCode.current = true;
		}
	}, [ detectedCountryCode ] );
}
