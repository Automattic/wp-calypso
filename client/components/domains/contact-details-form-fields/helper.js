/**
 * Returns true if postal codes are supported on the specified country code,
 * or false otherwise.
 *
 * @param {Array}  countries   Country list to check.
 * @param {string} countryCode Country code to check.
 * @returns {boolean}          Whether postal codes are supported in the country.
 */

export function getCountryPostalCodeSupport( countries, countryCode ) {
	return (
		countries.find( ( country ) => country.code === countryCode.toUpperCase() )?.has_postal_codes ??
		false
	);
}
