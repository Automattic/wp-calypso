import { get } from 'lodash';

import 'calypso/state/countries/init';

/**
 * @typedef {import('@automatic/wpcom-checkout').CountryListItem} CountryListItem
 */

/**
 * Retrieves the list of countries from the specified type.
 *
 * @param {Object} state - global state tree
 * @param {string} type - type of list ('domains, 'payments', or 'sms)
 * @returns {null|CountryListItem[]} the list of countries
 */
export default function getCountries( state, type ) {
	return get( state, [ 'countries', type ], null );
}
