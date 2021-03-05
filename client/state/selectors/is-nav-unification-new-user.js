/**
 * Internal dependencies
 */
import { getCurrentUserId } from 'calypso/state/current-user/selectors';

const NEW_USER_ID_THRESHOLD = 202731080; // ID of user who first registered on March 5, 2021.

export default ( state ) => {
	const userId = getCurrentUserId( state );

	// New Users.
	if ( userId >= NEW_USER_ID_THRESHOLD ) {
		return true;
	}

	// Disabled by default.
	return false;
};
