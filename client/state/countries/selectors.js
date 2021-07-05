/**
 * Internal dependencies
 */
import 'calypso/state/countries/init';

/**
 * Returns true if postal codes are supported on the specified country code,
 * or false otherwise.
 *
 * @param {string} countryCode Country code to check.
 * @returns {boolean}          Whether postal codes are supported in the country.
 */

export function getCountryPostalCodeSupport( state, countryCode ) {
	return (
		state.countries.domains.find( ( country ) => country.code === countryCode.toUpperCase() )
			?.has_postal_codes ?? false
	);
}
