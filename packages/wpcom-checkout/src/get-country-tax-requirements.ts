import type { CountryListItem } from './types';

export interface CountryTaxRequirements {
	city?: true;
	subdivision?: true;
	organization?: true;
	address?: true;
}

/**
 * Returns tax requirements for the specified country code.
 *
 * NOTE: Will return an empty object if the countries list is empty or if the country
 * code is not in the list! Always check that the countries list has loaded
 * before calling this.
 */
export function getCountryTaxRequirements(
	countries: CountryListItem[] | undefined,
	countryCode: string | undefined
): CountryTaxRequirements {
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
		( country ) =>
			country.code === countryCode.toUpperCase() ||
			( country.vat_supported && country.tax_country_codes.includes( countryCode.toUpperCase() ) )
	);
	if ( ! countryListItem ) {
		// eslint-disable-next-line no-console
		console.warn(
			`Warning: getCountryVatRequirements could not find the country "${ countryCode }"!`
		);
		return {};
	}
	const requirements: CountryTaxRequirements = {};
	if ( countryListItem.tax_needs_city ) {
		requirements.city = true;
	}
	if ( countryListItem.tax_needs_subdivision ) {
		requirements.subdivision = true;
	}
	if ( countryListItem.tax_needs_organization ) {
		requirements.organization = true;
	}
	if ( countryListItem.tax_needs_address ) {
		requirements.address = true;
	}
	return requirements;
}
