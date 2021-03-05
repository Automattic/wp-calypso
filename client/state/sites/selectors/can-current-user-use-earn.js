/**
 * Internal dependencies
 */
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import getSite from './get-site';

/**
 * Returns true if current user can see the Earn option in menu and corresponding page.
 *
 * @param  {object}   state  Global state tree
 * @param  {number}   siteId Site ID
 * @returns {?boolean}        Whether user can access the Earn section.
 */
export default function canCurrentUserUseEarn( state, siteId = null ) {
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}
	const site = getSite( state, siteId );
	return site && canCurrentUser( state, siteId, 'manage_options' );
}
