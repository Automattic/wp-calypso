/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/country-states/init';

/**
 * Returns an array of states objects for the specified country code, or null
 * if there are not states for the country.
 *
 *
 * @param {string} countryCode Country code to check.
 * @returns {?Array}             States objects, if known.
 */

export function getCountryStates( state, countryCode ) {
	return get( state.countryStates, [ 'items', countryCode.toLowerCase() ], null );
}

/**
 * Returns true if a request is in progress to retrieve states for
 * the specified country, or false otherwise.
 *
 * @param  {object}  state       Global state tree
 * @param  {string}  countryCode Country code to check.
 * @returns {boolean}             Whether a request is in progress
 */
export function isCountryStatesFetching( state, countryCode ) {
	return get( state.countryStates, [ 'isFetching', countryCode.toLowerCase() ], false );
}
