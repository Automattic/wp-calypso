/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Retrieves the list of countries from the specified type.
 *
 * @param {Object} state - global state tree
 * @param {String} type - type of list ('domains, 'payments', or 'sms)
 * @return {Array?} the list of countries
 */
export default function getCountries( state, type ) {
	return get( state, [ 'countries', type, 'items' ], null );
}
