import { getCurrentUserDate } from 'calypso/state/current-user/selectors';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

/**
 * Returns the number of days since the user signed up.
 *
 * @param {object} state Global state tree.
 * @returns {number} Days since user registration (rounded to nearest day).
 */
export default function getCurrentUserTimeSinceSignup( state ) {
	const signupDate = new Date( getCurrentUserDate( state ) );

	if ( ! signupDate ) {
		return null;
	}

	const todayDate = Date.now();

	return Math.round( ( todayDate - signupDate ) / DAY_IN_MS );
}
