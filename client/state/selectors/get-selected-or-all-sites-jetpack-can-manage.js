/** @format */

/**
 * Internal dependencies
 */

import createSelector from 'client/lib/create-selector';
import { getSelectedOrAllSites, canCurrentUser } from 'client/state/selectors';
import { isJetpackSite } from 'client/state/sites/selectors';

/**
 * Return an array with the selected site or all sites Jetpack can manage
 *
 * @param {Object} state  Global state tree
 * @return {Array}        Array of Sites objects with the result
 */
export default createSelector(
	state =>
		getSelectedOrAllSites( state ).filter(
			site =>
				isJetpackSite( state, site.ID ) &&
				site.canManage &&
				canCurrentUser( state, site.ID, 'manage_options' )
		),
	state => [ state.ui.selectedSiteId, state.sites.items, state.currentUser.capabilities ]
);
