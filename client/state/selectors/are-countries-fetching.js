/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Determines whether the list of countries from the specified type is being fetched.
 *
 * @param {Object} state - global state tree
 * @param {String} type - type of list ('domains, 'payments', or 'sms)
 * @return {Boolean} true if the list is being fetched, false otherwise
 */
export default function areCountriesFetching( state, type ) {
	return get( state, [ 'countries', type, 'isFetching' ], false );
}
