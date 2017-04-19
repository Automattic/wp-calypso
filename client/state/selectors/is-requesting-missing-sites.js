/**
 * Internal dependencies
 */
import { getCurrentUser } from 'state/current-user/selectors';
import { getSites } from 'state/selectors';

/**
 * Returns true if we are requesting sites we don't have yet.
 * @param {Object}    state  Global state tree
 * @return {Boolean}        Request State
 */
export default function isRequestingMissingSites( state ) {
	const user = getCurrentUser( state );
	const sites = getSites( state );
	return !! state.sites.requestingAll && sites.length !== user.site_count;
}
