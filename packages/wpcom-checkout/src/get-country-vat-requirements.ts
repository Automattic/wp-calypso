import type { CountryListItem } from './types';

export interface CountryVatRequirements {
	city?: true;
	region?: true;
	organization?: true;
}

/**
 * Returns VAT requirements for the specified country code.
 *
 * NOTE: Will return an empty object if the countries list is empty or if the country
 * code is not in the list! Always check that the countries list has loaded
 * before calling this.
 */
export function getCountryVatRequirements(
	countries: CountryListItem[],
	countryCode: string
): CountryVatRequirements {
	if ( ! countryCode ) {
		return {};
	}
	if ( ! countries?.length ) {
		// eslint-disable-next-line no-console
		console.error(
			'Error: getCountryVatRequirements was called without a countries list. This will result in incorrect data!'
		);
		return {};
	}
	const countryListItem = countries.find(
		( country ) => country.code === countryCode.toUpperCase()
	);
	if ( ! countryListItem ) {
		// eslint-disable-next-line no-console
		console.warn(
			`Warning: getCountryVatRequirements could not find the country "${ countryCode }"!`
		);
		return {};
	}
	const requirements: CountryVatRequirements = {};
	if ( countryListItem.vat_city ) {
		requirements.city = true;
	}
	if ( countryListItem.vat_region ) {
		requirements.region = true;
	}
	if ( countryListItem.vat_organization ) {
		requirements.organization = true;
	}
	return requirements;
}
