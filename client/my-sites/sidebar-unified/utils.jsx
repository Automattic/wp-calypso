/**
 * Internal dependencies
 */
import { getCurrentUserId, getCurrentUserDate } from 'calypso/state/current-user/selectors';

const LAUNCH_DATE = new Date( 'Mar 10 2021' );
const CURRENT_ROLLOUT_SEGMENT_PERCENTAGE = 5;
const HOURS_IN_MS = 1000 * 60 * 60;

export const isNewNavUnificationUser = ( state ) => {
	const userDate = getCurrentUserDate( state );

	if ( userDate && ( new Date( userDate ) - LAUNCH_DATE ) / HOURS_IN_MS > 24 ) {
		return true;
	}

	return false;
};

export const isNavUnificationEnabledForUser = ( state ) => {
	const userId = getCurrentUserId( state );

	if ( userId && userId % 100 < CURRENT_ROLLOUT_SEGMENT_PERCENTAGE + 1 ) {
		return true;
	}

	return false;
};
