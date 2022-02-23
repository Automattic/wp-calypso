import { get } from 'lodash';

import 'calypso/state/country-states/init';

/**
 * Returns an array of states objects for the specified country code, or null
 * if there are not states for the country.
 *
 *
 * @param {string} countryCode Country code to check.
 * @returns {?Array}             States objects, if known.
 */

export function getWoopCountryRegions( state, countryCode ) {
	return get( state.woopCountryRegions, [ 'items', countryCode.toLowerCase() ], null );
}

/**
 * Returns true if a request is in progress to retrieve states for
 * the specified country, or false otherwise.
 *
 * @param  {object}  state       Global state tree
 * @param  {string}  countryCode Country code to check.
 * @returns {boolean}             Whether a request is in progress
 */
export function isWoopCountryRegionsFetching( state, countryCode ) {
	return get( state.woopCountryRegions, [ 'isFetching', countryCode.toLowerCase() ], false );
}
