/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Retrieves the list of email accounts for the specified site.
 *
 * @param {object} state - global state tree
 * @param {number} siteId - identifier of the site
 * @returns {?Array} the list of accounts, null otherwise
 */
export default function getEmailAccounts( state, siteId ) {
	return get( state, [ 'emailAccounts', siteId, 'accounts' ], null );
}
