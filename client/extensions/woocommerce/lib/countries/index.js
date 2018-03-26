/** @format */

/**
 * External dependencies
 */

import { filter, includes, sortBy } from 'lodash';

/**
 * Whether or not we support store management in calypso for
 * the passed country
 * @param {string} country Country (code) to check
 * @return {bool} whether store management in calypso is supported
 */
export const isStoreManagementSupportedInCalypsoForCountry = country => {
	return includes( [ 'US', 'CA' ], country );
};

/**
 * Return a "sorted" list of countries, with a subset pulled to the top,
 * and the rest sorted alphabetically.
 * @param {array} list  List of countries to sort
 * @return {array} sorted list of countries
 */
export function sortPopularCountriesToTop( list ) {
	const popularCodes = [ 'AU', 'BR', 'CA', 'FR', 'DE', 'IT', 'ES', 'SE', 'GB', 'US' ];
	const popularCountries = filter( list, item => -1 !== popularCodes.indexOf( item.code ) );
	const otherCountries = filter( list, item => -1 === popularCodes.indexOf( item.code ) );

	return [
		...sortBy( popularCountries, 'name' ),
		{ code: '', continent: '', name: '' }, // Spacer option
		...sortBy( otherCountries, 'name' ),
	];
}
