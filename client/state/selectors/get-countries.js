/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/countries/init';

/**
 * Retrieves the list of countries from the specified type.
 *
 * @param {object} state - global state tree
 * @param {string} type - type of list ('domains, 'payments', or 'sms)
 * @returns {null|({code: string, name: string})[]} the list of countries
 */
export default function getCountries( state, type ) {
	return get( state, [ 'countries', type ], null );
}
