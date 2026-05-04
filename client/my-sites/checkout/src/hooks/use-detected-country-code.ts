import { useShoppingCart } from '@automattic/shopping-cart';
import { useDispatch } from '@wordpress/data';
import debugFactory from 'debug';
import { useRef, useEffect } from 'react';
import { useSelector } from 'calypso/state';
import { getCurrentUserCountryCode } from 'calypso/state/current-user/selectors';
import useCartKey from '../../use-cart-key';
import { CHECKOUT_STORE } from '../lib/wpcom-store';

const debug = debugFactory( 'calypso:composite-checkout:use-detected-country-code' );

export default function useDetectedCountryCode(): void {
	const detectedCountryCode = useSelector( getCurrentUserCountryCode );
	const refHaveUsedDetectedCountryCode = useRef( false );
	const { loadCountryCodeFromGeoIP } = useDispatch( CHECKOUT_STORE ) ?? {};
	const cartKey = useCartKey();
	const { responseCart, updateLocation } = useShoppingCart( cartKey );

	useEffect( () => {
		// Dispatch exactly once
		if (
			detectedCountryCode &&
			! refHaveUsedDetectedCountryCode.current &&
			loadCountryCodeFromGeoIP
		) {
			debug( 'using detected country code "' + detectedCountryCode + '"' );
			loadCountryCodeFromGeoIP( detectedCountryCode );
			refHaveUsedDetectedCountryCode.current = true;

			// Seed the cart's tax location from the geolocated country so taxes
			// appear in the summary before the user submits the contact form.
			// Skip the roundtrip when the cart already reflects this country.
			// Fire and forget — failures fall through to the cart's own error
			// surface and must not block the contact-form prefill path.
			const currentCartCountry = responseCart.tax?.location?.country_code ?? '';
			if ( currentCartCountry !== detectedCountryCode ) {
				updateLocation( { countryCode: detectedCountryCode } ).catch( () => {
					/* best-effort tax preview */
				} );
			}
		}
	}, [ detectedCountryCode, loadCountryCodeFromGeoIP, responseCart, updateLocation ] );
}
