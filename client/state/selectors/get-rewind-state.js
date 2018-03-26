/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

const uninitialized = {
	state: 'uninitialized',
};

/**
 * Get the entire Rewind state object.
 *
 * @param {Object} state Global state tree
 * @param {number|string} siteId the site ID
 * @return {Object} Rewind state object
 */
export default function getRewindState( state, siteId ) {
	return get( state.rewind, siteId, uninitialized );
}
