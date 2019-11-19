/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Determines whether the list of G Suite users for the specified site has loaded.
 *
 * @param {Object} state - global state tree
 * @param {Number} siteId - identifier of the site
 * @return {Boolean} true if the list of G Suite users has loaded, false otherwise
 */
export default function hasLoadedGSuiteUsers( state, siteId ) {
	return get( state, [ 'gsuiteUsers', siteId, 'users' ], null ) !== null;
}
