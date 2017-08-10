/** @format */
/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { isJetpackSite } from 'state/sites/selectors';

/**
 * Returns true if the user has one or more Jetpack sites, and false otherwise.
 *
 * @param {Object} state  Global state tree
 * @return {Boolean} Whether Jetpack sites exist or not
 */
export default createSelector( state => {
	const siteIds = Object.keys( state.sites.items );
	return siteIds.some( siteId => isJetpackSite( state, siteId ) );
}, state => state.sites.items );
