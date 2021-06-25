/**
 * Internal dependencies
 */
import { getCurrentUserId } from 'calypso/state/current-user/selectors';

const NEW_USER_ID_THRESHOLD = 203012733; // ID of user who registered on March 10, 2021 at 8am UTC.

export default ( state ) => {
	const userId = getCurrentUserId( state );

	// New Users.
	if ( userId >= NEW_USER_ID_THRESHOLD ) {
		return true;
	}

	// Disabled by default.
	return false;
};
