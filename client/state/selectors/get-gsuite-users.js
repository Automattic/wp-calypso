/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/gsuite-users/init';

/**
 * Retrieves the list of G Suite users for the specified site.
 *
 * @param {object} state - global state tree
 * @param {number} siteId - identifier of the site
 * @returns {?Array} the list of G Suite users, null otherwise
 */
export default function getGSuiteUsers( state, siteId ) {
	return get( state, [ 'gsuiteUsers', siteId, 'users' ], null );
}
