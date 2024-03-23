import {
	getCountryPostalCodeSupport,
	getCountryTaxRequirements,
	getContactDetailsType,
} from '@automattic/wpcom-checkout';
import debugFactory from 'debug';
import type { ResponseCart, UpdateTaxLocationInCart } from '@automattic/shopping-cart';
import type {
	ManagedContactDetails,
	CountryListItem,
	VatDetails,
} from '@automattic/wpcom-checkout';

const debug = debugFactory( 'calypso:update-cart-contact-details-for-checkout' );

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
	const countryCode = vatDetails.country ?? contactInfo?.countryCode?.value ?? '';
	const arePostalCodesSupported =
		areCountriesLoaded && countryCode
			? getCountryPostalCodeSupport( countriesList, countryCode )
			: false;
	const contactDetailsType = getContactDetailsType( responseCart );
	const taxRequirements = getCountryTaxRequirements( countriesList, countryCode ?? '' );

	if ( ! contactInfo ) {
		debug( 'not updating cart contact details; there is no contact info' );
		return;
	}
	if ( ! areCountriesLoaded ) {
		debug( 'not updating cart contact details; countries are not loaded' );
		return;
	}
	debug(
		`postal codes ${ arePostalCodesSupported ? 'are' : 'are not' } supported by`,
		countryCode
	);
	debug( 'contact details type is', contactDetailsType );
	debug( 'tax requirements for country are', taxRequirements );

	// The tax form does not include a subdivisionCode field but the server
	// will sometimes fill in the value on the cart itself so we should not
	// try to update it when the field does not exist.
	const subdivisionCode =
		taxRequirements.subdivision || contactDetailsType !== 'tax'
			? contactInfo.state?.value
			: undefined;

	// Organization and Address exist both in the contact info store and in
	// the VAT info store. We give priority to the VAT info for the cart, but
	// we use the contact info store if the VAT info is not set.
	const organization =
		vatDetails.name ??
		( taxRequirements.organization ? contactInfo.organization?.value : undefined ) ??
		'';
	const address =
		vatDetails.address ??
		( taxRequirements.address ? contactInfo.address1?.value : undefined ) ??
		'';

	const cartLocationData = {
		// Typically the contact country code and the VAT country code will be the
		// same, but the VAT form has special country codes it sometimes uses like
		// `XI` for Northern Ireland so we keep track of them separately and will
		// use whichever one for taxes that is more appropriate.
		countryCode,
		postalCode: arePostalCodesSupported ? contactInfo.postalCode?.value : '',
		subdivisionCode,
		vatId: vatDetails.id ?? '',
		organization,
		address,
		city: ( taxRequirements.city ? contactInfo.city?.value : undefined ) ?? '',
	};
	debug( 'updating cart with', cartLocationData );
	return updateLocation( cartLocationData );
}
