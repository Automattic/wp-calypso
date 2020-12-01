/**
 * Internal dependencies
 */
import createSelector from 'calypso/lib/create-selector';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import getSelectedOrAllSites from 'calypso/state/selectors/get-selected-or-all-sites';
import { isJetpackSite } from 'calypso/state/sites/selectors';

import 'calypso/state/ui/init';

/**
 * Return an array with the selected site or all sites Jetpack can manage
 *
 * @param {object} state  Global state tree
 * @returns {Array}        Array of Sites objects with the result
 */
export default createSelector(
	( state ) =>
		getSelectedOrAllSites( state ).filter(
			( site ) =>
				isJetpackSite( state, site.ID ) && canCurrentUser( state, site.ID, 'manage_options' )
		),
	( state ) => [ state.ui.selectedSiteId, state.sites.items, state.currentUser.capabilities ]
);
