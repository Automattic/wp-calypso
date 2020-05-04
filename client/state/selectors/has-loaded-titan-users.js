/**
 * Internal dependencies
 */
import getTitanUsers from 'state/selectors/get-titan-users';

/**
 * Determines whether the list of Titan users for the specified site has loaded.
 *
 * @param {object} state - global state tree
 * @param {number} siteId - identifier of the site
 * @returns {?boolean} true if the list of Titan users has loaded, false otherwise
 */
export default function hasLoadedTitanUsers( state, siteId ) {
	return getTitanUsers( state, siteId ) !== null;
}
