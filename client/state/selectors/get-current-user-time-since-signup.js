import { getCurrentUserDate } from 'calypso/state/current-user/selectors';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

/**
 * Returns the number of days since the user signed up.
 *
 * @param {object} state Global state tree.
 * @returns {number} Days since user registration.
 */
export default function getCurrentUserTimeSinceSignup( state ) {
	const signupDate = getCurrentUserDate( state );

	if ( ! signupDate ) {
		return null;
	}

	const todayDate = Date.now();

	return todayDate - Date( signupDate ) / DAY_IN_MS;
}
