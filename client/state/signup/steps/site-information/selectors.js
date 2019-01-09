/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns an array of site information key/value pairs defined by the keys in fieldNames
 *
 * @param {Object} state     Global state tree
 * @return {Object}          Signup site information key/pairs, inc. 'address', 'phone'
 */
export function getSiteInformation( state ) {
	return get( state, 'signup.steps.siteInformation', {} );
}
