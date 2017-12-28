/** @format */

/**
 * Internal dependencies
 */

import createSelector from 'client/lib/create-selector';
import { getSites } from 'client/state/selectors';
import { isJetpackSite } from 'client/state/sites/selectors';

/**
 * Get all Jetpack sites
 *
 * @param {Object} state  Global state tree
 * @return {Array}        Array of Jetpack Sites objects
 */
export default createSelector(
	state => getSites( state ).filter( site => isJetpackSite( state, site.ID ) ),
	state => [ state.sites.items, state.currentUser.capabilities ]
);
