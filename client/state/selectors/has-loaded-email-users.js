/**
 * Internal dependencies
 */
import hasLoadedGSuiteUsers from 'state/selectors/has-loaded-gsuite-users';
import hasLoadedTitanUsers from 'state/selectors/has-loaded-titan-users';

/**
 * Determines whether the list of all email users for the specified site has loaded.
 *
 * @param {object} state - global state tree
 * @param {number} siteId - identifier of the site
 * @returns {?boolean} true if the list of users has loaded, false otherwise
 */
export default function hasLoadedEmailUsers( state, siteId ) {
	return hasLoadedGSuiteUsers( state, siteId ) && hasLoadedTitanUsers( state, siteId );
}
