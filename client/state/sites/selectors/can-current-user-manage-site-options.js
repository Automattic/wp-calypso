import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Whether the user can manage site options.
 *
 * @param {Object} state Global state tree
 * @param {number} siteId ID of the site
 * @returns {boolean} Whether the use can manage site options
 */
export default function canCurrentUserManageSiteOptions( state, siteId = null ) {
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}
	return canCurrentUser( state, siteId, 'manage_options' );
}
