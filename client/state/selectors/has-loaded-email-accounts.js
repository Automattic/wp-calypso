/**
 * Internal dependencies
 */
import getEmailAccounts from 'state/selectors/get-email-accounts';

/**
 * Determines whether the list of email accounts for the specified site has loaded.
 *
 * @param {object} state - global state tree
 * @param {number} siteId - identifier of the site
 * @returns {?boolean} true if the list of accounts has loaded, false otherwise
 */
export default function hasLoadedEmailAccounts( state, siteId ) {
	return getEmailAccounts( state, siteId ) !== null;
}
