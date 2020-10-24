/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import canCurrentUser from 'calypso/state/selectors/can-current-user';

/**
 * Returns true if the current user can edit settings of the selected site.
 * Used in the siteTitle tour.
 *
 * @param {object} state Global state tree
 * @returns {boolean} True if user can edit settings, false otherwise.
 */
export const canUserEditSettingsOfSelectedSite = ( state ) => {
	const siteId = getSelectedSiteId( state );
	return siteId ? canCurrentUser( state, siteId, 'manage_options' ) : false;
};
