/** @format */
/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { getCurrentUser } from 'client/state/current-user/selectors';

/**
 * Returns register date of the current user
 *
 * @param {Object} state Global state tree
 * @return {Number|Boolean} Timestamp registar date, false if cannot be determined
 */
export default function getCurrentUserRegisterDate( state ) {
	const user = getCurrentUser( state );
	const registerDate = user && Date.parse( user.date );

	return registerDate ? registerDate : false;
}
