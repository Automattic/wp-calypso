/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Retrieves the list of Titan users for the specified site.
 *
 * @param {object} state - global state tree
 * @param {number} siteId - identifier of the site
 * @returns {?Array} the list of Titan users, null otherwise
 */
export default function getTitanUsers( state, siteId ) {
	return get( state, [ 'titanUsers', siteId, 'users' ], null );
}
