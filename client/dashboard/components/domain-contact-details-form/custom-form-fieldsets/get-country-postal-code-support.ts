import { type CountryListItem } from './types';

/**
 * Returns true if postal codes are supported on the specified country code.
 *
 * NOTE: Will return false if the countries list is empty or if the country
 * code is not in the list! Always check that the countries list has loaded
 * before calling this.
 */
export function getCountryPostalCodeSupport(
	countries: CountryListItem[],
	countryCode: string
): boolean {
	if ( ! countryCode || ! countries?.length ) {
		return false;
	}

	const countryListItem = countries.find(
		( country ) =>
			country.code === countryCode.toUpperCase() ||
			( country.vat_supported && country.tax_country_codes.includes( countryCode.toUpperCase() ) )
	);

	return countryListItem?.has_postal_codes ?? false;
}
