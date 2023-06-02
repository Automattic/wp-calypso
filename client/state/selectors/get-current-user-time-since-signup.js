import { getCurrentUserDate } from 'calypso/state/current-user/selectors';

/**
 * Returns the number of days since the user signed up.
 *
 * @param {Object} state Global state tree.
 * @returns {number} Days since user registration (rounded to nearest day).
 */
export default function getCurrentUserTimeSinceSignup( state ) {
	const DAY_IN_MS = 86400000;
	const signupDate = new Date( getCurrentUserDate( state ) );

	if ( ! signupDate ) {
		return null;
	}

	const todayDate = Date.now();

	return Math.round( ( todayDate - signupDate ) / DAY_IN_MS );
}
