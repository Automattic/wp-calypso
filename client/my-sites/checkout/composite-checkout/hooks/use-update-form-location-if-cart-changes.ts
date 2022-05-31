import { useShoppingCart } from '@automattic/shopping-cart';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import type { ManagedContactDetails } from '@automattic/wpcom-checkout';

export function useUpdateFormLocationIfCartChanges(): void {
	const contactInfo: ManagedContactDetails = useSelect( ( select ) =>
		select( 'wpcom-checkout' ).getContactInfo()
	);
	const checkoutStoreActions = useDispatch( 'wpcom-checkout' );
	const { responseCart } = useShoppingCart();

	if ( ! checkoutStoreActions?.updateCountryCode ) {
		throw new Error(
			'useUpdateFormLocationIfCartChanges must be run after the checkout data store has been initialized'
		);
	}
	const { updateCountryCode, updatePostalCode } = checkoutStoreActions;

	const cartCountry = responseCart.tax.location.country_code ?? '';
	const cartPostal = responseCart.tax.location.postal_code ?? '';
	const contactCountry = contactInfo.countryCode?.value ?? '';
	const contactPostal = contactInfo.postalCode?.value ?? '';
	const doesCartMatchContact = cartCountry === contactCountry && cartPostal === contactPostal;

	useEffect( () => {
		if ( doesCartMatchContact ) {
			return;
		}
		updateCountryCode( cartCountry );
		updatePostalCode( cartPostal );
	}, [ cartCountry, cartPostal, doesCartMatchContact, updateCountryCode, updatePostalCode ] );
}
