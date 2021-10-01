import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getRawSite from 'calypso/state/selectors/get-raw-site';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Returns true if hosting section should be viewable
 *
 * @param  {object}  state  Global state tree
 * @returns {boolean}        Whether site can display the atomic hosting section
 */
export default function canSiteViewAtomicHosting( state ) {
	const siteId = getSelectedSiteId( state );

	if ( ! getRawSite( state, siteId ) ) {
		return false;
	}

	return canCurrentUser( state, siteId, 'view_hosting' );
}
