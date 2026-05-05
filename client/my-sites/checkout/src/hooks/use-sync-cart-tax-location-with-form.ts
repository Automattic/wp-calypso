import { useShoppingCart } from '@automattic/shopping-cart';
import { isValidPostalCode } from '@automattic/wpcom-checkout';
import { useSelect } from '@wordpress/data';
import { useEffect, useRef } from 'react';
import useCartKey from '../../use-cart-key';
import { updateCartContactDetailsForCheckout } from '../lib/update-cart-contact-details-for-checkout';
import { CHECKOUT_STORE } from '../lib/wpcom-store';
import useCountryList from './use-country-list';
import type { ManagedContactDetails, VatDetails } from '@automattic/wpcom-checkout';

const DEBOUNCE_MS = 400;

/**
 * Watches every tax-affecting field on the checkout contact form (country,
 * state, city, postal code, plus the VAT form's organization, address, VAT
 * ID, and B2B flag) and pushes them to the cart's tax location when they
 * change. The summary's tax line then reflects the final amount as soon as
 * the user has typed enough information for the backend to resolve it —
 * without waiting for the contact step to be submitted.
 *
 * Free-text fields (city, postal code, etc.) are debounced so we make a
 * single cart update at the end of a typing burst rather than one per
 * keystroke. The cart manager's own `SET_LOCATION` reducer no-ops same-state
 * updates, so the network roundtrip only fires when something actually
 * changed.
 *
 * Delegates to `updateCartContactDetailsForCheckout` so the payload built
 * here matches what gets sent on contact-step submit (VAT/contact field
 * precedence, country-specific tax requirement gating, etc.).
 */
export default function useSyncCartTaxLocationWithForm(): void {
	const cartKey = useCartKey();
	const { responseCart, updateLocation } = useShoppingCart( cartKey );
	const countriesList = useCountryList();
	const contactInfo = useSelect(
		( select ) =>
			( select( CHECKOUT_STORE ) as { getContactInfo(): ManagedContactDetails } ).getContactInfo(),
		[]
	);
	const vatDetails = useSelect(
		( select ) => ( select( CHECKOUT_STORE ) as { getVatDetails(): VatDetails } ).getVatDetails(),
		[]
	);

	// Hold the latest non-primitive args in a ref so the debounced callback
	// always uses fresh values without re-binding the effect on every render.
	const latestArgs = useRef( {
		countriesList,
		responseCart,
		updateLocation,
		contactInfo,
		vatDetails,
	} );
	latestArgs.current = { countriesList, responseCart, updateLocation, contactInfo, vatDetails };

	// Re-run only on the primitive signals that actually affect the tax
	// location. Object identities from useSelect / useShoppingCart change on
	// every cart fetch and would otherwise loop the effect.
	const countryCode = contactInfo?.countryCode?.value ?? '';
	const subdivisionCode = contactInfo?.state?.value ?? '';
	const city = contactInfo?.city?.value ?? '';
	const postalCode = contactInfo?.postalCode?.value ?? '';
	const organization = contactInfo?.organization?.value ?? '';
	const address = contactInfo?.address1?.value ?? '';
	const vatId = vatDetails?.id ?? '';
	const vatCountry = vatDetails?.country ?? '';
	const isForBusiness = vatDetails?.isForBusiness ?? false;

	useEffect( () => {
		const args = latestArgs.current;
		if ( ! args.countriesList.length ) {
			return;
		}
		if ( ! countryCode && ! vatCountry ) {
			return;
		}
		// While the user is mid-way through typing a postal code that does not
		// yet match the country's expected format (today only US is checked, but
		// `isValidPostalCode` is the right hook for adding more), hold off on
		// the cart roundtrip — partial codes won't yield a meaningful tax and
		// just churn the network. Empty postal codes are allowed: the user may
		// have only entered country + state so far, which is enough for some
		// tax calcs and the right starting point for others.
		if ( postalCode && ! isValidPostalCode( postalCode, countryCode ) ) {
			return;
		}
		const handle = setTimeout( () => {
			const fresh = latestArgs.current;
			updateCartContactDetailsForCheckout(
				fresh.countriesList,
				fresh.responseCart,
				fresh.updateLocation,
				fresh.contactInfo,
				fresh.vatDetails
			).catch( () => {
				/* best-effort tax preview */
			} );
		}, DEBOUNCE_MS );
		return () => clearTimeout( handle );
		// eslint-disable-next-line react-hooks/exhaustive-deps -- intentional:
		// the non-primitive deps are read from latestArgs.current to avoid a
		// render loop, and only the primitive tax-affecting values should
		// re-bind the debounced effect.
	}, [
		countryCode,
		subdivisionCode,
		city,
		postalCode,
		organization,
		address,
		vatId,
		vatCountry,
		isForBusiness,
	] );
}
