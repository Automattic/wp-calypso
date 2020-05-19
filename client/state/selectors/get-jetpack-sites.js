/**
 * Internal dependencies
 */

import createSelector from 'lib/create-selector';
import getSites from 'state/selectors/get-sites';
import { isJetpackSite } from 'state/sites/selectors';

/**
 * Get all Jetpack sites
 *
 * @param {object} state  Global state tree
 * @returns {Array}        Array of Jetpack Sites objects
 */
export default createSelector(
	( state ) => getSites( state ).filter( ( site ) => isJetpackSite( state, site.ID ) ),
	( state ) => [ state.sites.items, state.currentUser.capabilities ]
);
