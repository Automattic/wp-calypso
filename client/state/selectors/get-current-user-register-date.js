/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { getCurrentUser } from 'calypso/state/current-user/selectors';

/**
 * Returns register date of the current user
 *
 * @param {object} state Global state tree
 * @returns {number|boolean} Timestamp registar date, false if cannot be determined
 */
export default function getCurrentUserRegisterDate( state ) {
	const user = getCurrentUser( state );
	const registerDate = user && Date.parse( user.date );

	return registerDate ? registerDate : false;
}
