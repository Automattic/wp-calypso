import { getCurrentUserId } from 'calypso/state/current-user/selectors';

export default ( state, thresholdUserId ) => {
	const userId = getCurrentUserId( state );

	// New Users.
	if ( userId >= thresholdUserId ) {
		return true;
	}

	// Disabled by default.
	return false;
};
