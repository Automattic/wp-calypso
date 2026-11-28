import debugFactory from 'debug';
import { useRef, useEffect } from 'react';
import { contactDetailsActions } from '../lib/checkout-stores';

const debug = debugFactory( 'calypso:composite-checkout:use-detected-country-code' );

export default function useDetectedCountryCode( detectedCountryCode: string | undefined ): void {
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
