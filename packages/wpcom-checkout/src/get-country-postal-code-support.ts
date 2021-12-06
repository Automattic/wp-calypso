import type { CountryListItem } from './types';

/**
 * Returns true if postal codes are supported on the specified country code,
 * or false otherwise.
 */
export function getCountryPostalCodeSupport(
	countries: CountryListItem[],
	countryCode: string
): boolean {
	return (
		countries.find( ( country ) => country.code === countryCode.toUpperCase() )?.has_postal_codes ??
		false
	);
}
