import { useShoppingCart } from '@automattic/shopping-cart';
import { useSelect } from '@wordpress/data';
import { useEffect, useRef } from 'react';
import useCartKey from '../../use-cart-key';
import { CHECKOUT_STORE } from '../lib/wpcom-store';
import type { ManagedContactDetails } from '@automattic/wpcom-checkout';

/**
 * Watches the checkout contact form's country selection and pushes it to the
 * cart's tax location, so VAT / sales tax in the summary updates as soon as a
 * country is chosen — without waiting for the user to submit the contact step.
 *
 * The push carries country only. For countries whose tax requires a
 * subdivision (e.g. US sales tax, CA GST), the cart endpoint responds with
 * no tax until a state is provided, which clears any previous tax computed
 * for the prior country.
 *
 * Fires for every distinct country the contact form lands on, including
 * geolocation prefill, cached domain contact details, and manual changes
 * from the country dropdown. The cart manager skips the server roundtrip
 * when the cart already reflects the country, and a local ref guards
 * against duplicate fires for the same value.
 */
export default function useSyncCartTaxCountryWithForm(): void {
	const cartKey = useCartKey();
	const { responseCart, updateLocation } = useShoppingCart( cartKey );
	const contactCountryCode = useSelect(
		( select ) =>
			( select( CHECKOUT_STORE ) as { getContactInfo(): ManagedContactDetails } ).getContactInfo()
				?.countryCode?.value ?? '',
		[]
	);
	const lastSyncedCountry = useRef< string | null >( null );

	useEffect( () => {
		if ( ! contactCountryCode ) {
			return;
		}
		if ( lastSyncedCountry.current === contactCountryCode ) {
			return;
		}
		lastSyncedCountry.current = contactCountryCode;
		const cartCountry = responseCart.tax?.location?.country_code ?? '';
		if ( cartCountry === contactCountryCode ) {
			return;
		}
		updateLocation( { countryCode: contactCountryCode } ).catch( () => {
			/* best-effort tax preview */
		} );
	}, [ contactCountryCode, responseCart, updateLocation ] );
}
