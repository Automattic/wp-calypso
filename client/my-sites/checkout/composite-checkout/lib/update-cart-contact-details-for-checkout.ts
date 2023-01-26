import { getCountryPostalCodeSupport } from '@automattic/wpcom-checkout';
import getContactDetailsType from '../lib/get-contact-details-type';
import type { ResponseCart, UpdateTaxLocationInCart } from '@automattic/shopping-cart';
import type {
	ManagedContactDetails,
	CountryListItem,
	VatDetails,
} from '@automattic/wpcom-checkout';

/**
 * Update the shopping cart's tax location to adjust its prices.
 */
export async function updateCartContactDetailsForCheckout(
	countriesList: CountryListItem[],
	responseCart: ResponseCart,
	updateLocation: UpdateTaxLocationInCart,
	contactInfo: ManagedContactDetails | undefined,
	vatDetails: VatDetails
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
		// Typically the contact country code and the VAT country code will be the
		// same, but the VAT form has special country codes it sometimes uses like
		// `XI` for Northern Ireland so we keep track of them separately and will
		// use whichever one for taxes that is more appropriate.
		countryCode: vatDetails.country || contactInfo.countryCode?.value || '',
		postalCode: arePostalCodesSupported ? contactInfo.postalCode?.value : '',
		subdivisionCode,
		vatId: vatDetails.id ?? '',
		organization: vatDetails.name ?? '',
	} );
}
