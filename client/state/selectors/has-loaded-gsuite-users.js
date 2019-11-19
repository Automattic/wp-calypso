/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Determines whether the list of G Suite users for the specified site has loaded.
 *
 * @param {object} state - global state tree
 * @param {number} siteId - identifier of the site
 * @returns {boolean} true if the list of G Suite users has loaded, false otherwise
 */
export default function hasLoadedGSuiteUsers( state, siteId ) {
	return get( state, [ 'gsuiteUsers', siteId, 'users' ], null ) !== null;
}
