/**
 * Internal dependencies
 */

import { getCurrentUser } from 'calypso/state/current-user/selectors';
import getSites from 'calypso/state/selectors/get-sites';

/**
 * Returns true if we are requesting sites we don't have yet.
 *
 * @param {object}    state  Global state tree
 * @returns {boolean}        Request State
 */
export default function isRequestingMissingSites( state ) {
	const user = getCurrentUser( state );
	const sites = getSites( state );
	return !! state.sites.requestingAll && sites.length !== user.site_count;
}
