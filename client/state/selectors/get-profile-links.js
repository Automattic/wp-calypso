/**
 * Returns all profile links of the current user.
 *
 * @param {object}  state  Global state tree
 * @return {?Array}        Profile links
 */
export default function getProfileLinks( state ) {
	return state.userProfileLinks.items;
}
