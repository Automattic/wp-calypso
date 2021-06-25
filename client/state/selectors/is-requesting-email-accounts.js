/**
 * External dependencies
 */
import { get } from 'lodash';
import 'calypso/state/email-accounts/init';

/**
 * Determines whether the list of email accounts is being requested.
 *
 * @param {object} state - global state tree
 * @param {number} siteId - identifier of the site
 * @returns {?boolean} true if the list is being requested, false otherwise
 */
export default function isRequestingEmailAccounts( state, siteId ) {
	return get( state, [ 'emailAccounts', siteId, 'requesting' ], false );
}
