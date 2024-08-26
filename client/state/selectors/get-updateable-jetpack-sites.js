import { createSelector } from '@wordpress/data';
import getSelectedOrAllSitesWithPlugins from 'calypso/state/selectors/get-selected-or-all-sites-with-plugins';
import { canJetpackSiteUpdateFiles } from 'calypso/state/sites/selectors';

/**
 * Retrieves all Jetpack sites that are allowed to be updated.
 * @param   {Object} state Global state tree
 * @returns {Array}        Array of updateable Jetpack sites
 */
export default createSelector(
	( state ) =>
		getSelectedOrAllSitesWithPlugins( state ).filter( ( site ) =>
			canJetpackSiteUpdateFiles( state, site.ID )
		),
	( state ) => [ state.sites.items ]
);
