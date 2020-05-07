/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Determines whether the list of Titan users is being requested.
 *
 * @param {object} state - global state tree
 * @param {number} siteId - identifier of the site
 * @returns {?boolean} true if the list of users is being requested, false otherwise
 */
export default function isRequestingTitanUsers( state, siteId ) {
	return get( state, [ 'titanUsers', siteId, 'requesting' ], false );
}
