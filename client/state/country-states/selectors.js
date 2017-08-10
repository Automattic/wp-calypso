/** @format */
/**
 * Returns an array of states objects for the specified country code, or null
 * if there are not states for the country.
 *
 * @param  {Object} state       Global state tree
 * @param  {String} countryCode Country code to check.
 * @return {?Array}             States objects, if known.
 */
export function getCountryStates( state, countryCode ) {
	return state.countryStates.items[ countryCode.toLowerCase() ] || null;
}

/**
 * Returns true if a request is in progress to retrieve states for
 * the specified country, or false otherwise.
 *
 * @param  {Object}  state       Global state tree
 * @param  {String}  countryCode Country code to check.
 * @return {Boolean}             Whether a request is in progress
 */
export function isCountryStatesFetching( state, countryCode ) {
	return state.countryStates.isFetching[ countryCode.toLowerCase() ] || false;
}
