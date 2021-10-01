import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSelectedSite } from 'calypso/state/ui/selectors';

/**
 * Returns true if the current user can run customizer for the selected site
 *
 * @param {object} state Global state tree
 * @returns {boolean} True if user can run customizer, false otherwise.
 */
export const isSelectedSiteCustomizable = ( state ) =>
	canCurrentUser( state, getSelectedSite( state ), 'edit_theme_options' );
