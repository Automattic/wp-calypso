/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/gsuite-users/init';

/**
 * Determines whether the list of G Suite users is being requested.
 *
 * @param {object} state - global state tree
 * @param {number} siteId - identifier of the site
 * @returns {?boolean} true if the list of G Suite users is being requested, false otherwise
 */
export default function isRequestingGSuiteUsers( state, siteId ) {
	return get( state, [ 'gsuiteUsers', siteId, 'requesting' ], false );
}
