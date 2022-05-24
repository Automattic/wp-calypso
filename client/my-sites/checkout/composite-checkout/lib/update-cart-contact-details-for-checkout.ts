import { getCountryPostalCodeSupport } from '@automattic/wpcom-checkout';
import getContactDetailsType from '../lib/get-contact-details-type';
import type { ResponseCart, UpdateTaxLocationInCart } from '@automattic/shopping-cart';
import type { ManagedContactDetails, CountryListItem } from '@automattic/wpcom-checkout';

export function updateCartContactDetailsForCheckout(
	activePaymentMethodId: string | undefined | null,
	countriesList: CountryListItem[],
	responseCart: ResponseCart,
	updateLocation: UpdateTaxLocationInCart,
	contactInfo: ManagedContactDetails | undefined
): void {
	const areCountriesLoaded = !! countriesList.length;
	const arePostalCodesSupported =
		areCountriesLoaded && contactInfo?.countryCode?.value
			? getCountryPostalCodeSupport( countriesList, contactInfo.countryCode.value )
			: false;
	const contactDetailsType = getContactDetailsType( responseCart );

	if ( ! activePaymentMethodId || ! contactInfo || areCountriesLoaded ) {
		return;
	}

	const nonTaxPaymentMethods = [ 'free-purchase' ];

	// When the contact details change, update the tax location in cart if the
	// active payment method is taxable.
	if ( nonTaxPaymentMethods.includes( activePaymentMethodId ) ) {
		// This data is intentionally empty so we do not charge taxes
		updateLocation( {
			countryCode: '',
			postalCode: '',
			subdivisionCode: '',
		} );
	} else {
		// The tax form does not include a subdivisionCode field but the server
		// will sometimes fill in the value on the cart itself so we should not
		// try to update it when the field does not exist.
		const subdivisionCode = contactDetailsType === 'tax' ? undefined : contactInfo.state?.value;
		updateLocation( {
			countryCode: contactInfo.countryCode?.value,
			postalCode: arePostalCodesSupported ? contactInfo.postalCode?.value : '',
			subdivisionCode,
		} );
	}
}
