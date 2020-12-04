/**
 * External dependencies
 */
import { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { defaultRegistry } from '@automattic/composite-checkout';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { getCurrentUserCountryCode } from 'calypso/state/current-user/selectors';

const debug = debugFactory( 'calypso:composite-checkout:use-detected-country-code' );
const { dispatch } = defaultRegistry;

export default function useDetectedCountryCode() {
	const detectedCountryCode = useSelector( getCurrentUserCountryCode );
	const refHaveUsedDetectedCountryCode = useRef( false );

	useEffect( () => {
		// Dispatch exactly once
		if ( detectedCountryCode && ! refHaveUsedDetectedCountryCode.current ) {
			debug( 'using detected country code "' + detectedCountryCode + '"' );
			dispatch( 'wpcom' ).loadCountryCodeFromGeoIP( detectedCountryCode );
			refHaveUsedDetectedCountryCode.current = true;
		}
	}, [ detectedCountryCode ] );
}
