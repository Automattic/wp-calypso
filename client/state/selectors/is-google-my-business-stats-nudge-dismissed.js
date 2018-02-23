/** @format */

/**
 * Internal dependencies
 */
import { getPreference } from 'state/preferences/selectors';

const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_DISMISS = 2;

/**
 * Returns the number of times the current user dismissed the nudge
 *
 * @param  {Object}  state  Global state tree
 * @return {Number}  Count the number of times the nudge has been dismissed
 */
const getDismissCount = state => {
	const preference = getPreference( state, 'google-my-business-dismissible-nudge' );
	return preference ? preference.timesDismissed : 0;
};

/**
 * Returns the last time the nudge was dismissed by the current user or 0 if it was never dismissed
 *
 * @param  {Object}  state  Global state tree
 * @return {Number}  Timestamp marking the last time the nudge was dismissed
 */
const getLastDismissTime = state => {
	const preference = getPreference( state, 'google-my-business-dismissible-nudge' );
	return preference ? preference.lastDismissed : 0;
};

/**
 * Returns true if the Google My Business nudge has recently been dismissed by the current user
 * and this action is still effective
 *
 * The conditions for it to be effective (and thus make the nudge invisible) are the following:
 * - The last time it was dismissed must be less than 2 weeks ago
 * OR
 * - It must have been dismissed more than MAX_DISMISS times in total
 *
 * @param  {Object}  state  Global state tree
 * @return {Boolean} True if the nudge has been dismissed
 */
const isGoogleMyBusinessStatsNudgeDismissed = state => {
	const lastDismissTime = getLastDismissTime( state );
	// Return false if it has never been dismissed
	if ( lastDismissTime === 0 ) {
		return false;
	}

	if ( getDismissCount( state ) >= MAX_DISMISS ) {
		return true;
	}

	return lastDismissTime > Date.now() - 2 * WEEK_IN_MS;
};

export default isGoogleMyBusinessStatsNudgeDismissed;
