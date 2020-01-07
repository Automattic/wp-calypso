/**
 * Internal Dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import getRawSite from 'state/selectors/get-raw-site';
import canCurrentUser from 'state/selectors/can-current-user';

/**
 * Returns true if hosting section should be viewable
 *
 * @param  {object}  state  Global state tree
 * @returns {?boolean}        Whether site can display the atomic hosting section
 */
export default function canSiteViewAtomicHosting( state ) {
	const siteId = getSelectedSiteId( state );

	if ( ! getRawSite( state, siteId ) ) {
		return false;
	}

	return canCurrentUser( state, siteId, 'view_hosting' );
}
