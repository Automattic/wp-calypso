import { getCountryPostalCodeSupport } from '@automattic/wpcom-checkout';
import getContactDetailsType from '../lib/get-contact-details-type';
import type { ResponseCart, UpdateTaxLocationInCart } from '@automattic/shopping-cart';
import type { ManagedContactDetails, CountryListItem } from '@automattic/wpcom-checkout';

export async function updateCartContactDetailsForCheckout(
	countriesList: CountryListItem[],
	responseCart: ResponseCart,
	updateLocation: UpdateTaxLocationInCart,
	contactInfo: ManagedContactDetails | undefined
): Promise< void | ResponseCart > {
	const areCountriesLoaded = !! countriesList.length;
	const arePostalCodesSupported =
		areCountriesLoaded && contactInfo?.countryCode?.value
			? getCountryPostalCodeSupport( countriesList, contactInfo.countryCode.value )
			: false;
	const contactDetailsType = getContactDetailsType( responseCart );

	if ( ! contactInfo || ! areCountriesLoaded ) {
		return;
	}

	// The tax form does not include a subdivisionCode field but the server
	// will sometimes fill in the value on the cart itself so we should not
	// try to update it when the field does not exist.
	const subdivisionCode = contactDetailsType === 'tax' ? undefined : contactInfo.state?.value;
	return updateLocation( {
		countryCode: contactInfo.countryCode?.value,
		postalCode: arePostalCodesSupported ? contactInfo.postalCode?.value : '',
		subdivisionCode,
	} );
}
