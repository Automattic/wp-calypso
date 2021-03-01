/**
 * Internal dependencies
 */
import getSelectedOrAllSitesWithPlugins from 'calypso/state/selectors/get-selected-or-all-sites-with-plugins';
import { canJetpackSiteUpdateFiles } from 'calypso/state/sites/selectors';

/**
 * Retrieves all Jetpack sites that are allowed to be updated.
 *
 * @param   {object} state Global state tree
 * @returns {Array}        Array of updateable Jetpack sites
 */
export default function getUpdateableJetpackSites( state ) {
	const sites = getSelectedOrAllSitesWithPlugins( state );
	return sites.filter( ( site ) => canJetpackSiteUpdateFiles( state, site.ID ) );
}
