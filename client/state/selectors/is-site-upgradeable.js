/**
 * Internal dependencies
 */

import canCurrentUser from 'calypso/state/selectors/can-current-user';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import getRawSite from 'calypso/state/selectors/get-raw-site';

/**
 * Returns true if the site can be upgraded by the user, false if the
 * site cannot be upgraded, or null if upgrade ability cannot be
 * determined.
 *
 * @param  {object}   state  Global state tree
 * @param  {number}   siteId Site ID
 * @returns {?boolean}        Whether site is upgradeable
 */
export default function ( state, siteId ) {
	// Cannot determine site upgradeability if there is no current user
	if ( ! getCurrentUserId( state ) || ! getRawSite( state, siteId ) ) {
		return null;
	}

	return canCurrentUser( state, siteId, 'manage_options' );
}
