import type { CountryListItem } from './types';

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
	if ( ! countryCode ) {
		return false;
	}
	if ( ! countries?.length ) {
		// eslint-disable-next-line no-console
		console.error(
			'Error: getCountryPostalCodeSupport was called without a countries list. This will result in incorrect data!'
		);
		return false;
	}
	const countryListItem = countries.find(
		( country ) => country.code === countryCode.toUpperCase()
	);
	if ( ! countryListItem ) {
		// eslint-disable-next-line no-console
		console.warn(
			`Warning: getCountryPostalCodeSupport could not find the country "${ countryCode }"!`
		);
		return false;
	}
	return countryListItem.has_postal_codes ?? false;
}
