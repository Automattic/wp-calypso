/** @format */

/**
 * Returns all profile links of the current user.
 *
 * @param {Object}  state  Global state tree
 * @return {Object}        Profile links
 */
export default function getProfileLinks( state ) {
	return state.profileLinks.items;
}
