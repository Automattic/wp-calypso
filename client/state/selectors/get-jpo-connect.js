/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Get object with Jetpack connection properties.
 * @param  {Object} state Global state tree
 * @return {Object} Jetpack connection object
 */
export default function getJpoConnect( state ) {
	return get( state, [ 'signup', 'dependencyStore', 'jpoConnect' ], null );
}
