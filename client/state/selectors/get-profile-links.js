/**
 * Internal dependencies
 */
import 'calypso/state/profile-links/init';

/**
 * Returns all profile links of the current user.
 *
 * @param {object}  state  Global state tree
 * @returns {?Array}        Profile links
 */
export default function getProfileLinks( state ) {
	return state.userProfileLinks?.items;
}
