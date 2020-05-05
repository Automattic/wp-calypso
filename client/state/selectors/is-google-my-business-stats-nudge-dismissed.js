/**
 * External dependencies
 */
import { last } from 'lodash';

/**
 * Internal dependencies
 */
import getGoogleMyBusinessStatsNudgeDismissCount from 'state/selectors/get-google-my-business-stats-nudge-dismiss-count';
import { getPreference } from 'state/preferences/selectors';

const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_DISMISS = 2;

/**
 * Returns the last time the nudge was dismissed by the current user or 0 if it was never dismissed
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId The Id of the site
 * @returns {number}  Timestamp marking the last time the nudge was dismissed
 */
const getLastDismissTime = ( state, siteId ) => {
	const preference = getPreference( state, 'google-my-business-dismissible-nudge' ) || {};
	const sitePreference = preference[ siteId ] || [];
	const lastEvent = last( sitePreference.filter( ( event ) => 'dismiss' === event.type ) );

	return lastEvent ? lastEvent.dismissedAt : 0;
};

/**
 * Returns true if the Google My Business nudge has recently been dismissed by the current user
 * and this action is still effective for this site
 *
 * The conditions for it to be effective (and thus make the nudge invisible) are the following:
 * - The last time it was dismissed must be less than 2 weeks ago
 * OR
 * - It must have been dismissed more than MAX_DISMISS times in total
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId The Id of the site
 * @returns {boolean} True if the nudge has been dismissed
 */
export default function isGoogleMyBusinessStatsNudgeDismissed( state, siteId ) {
	const lastDismissTime = getLastDismissTime( state, siteId );

	// Return false if it has never been dismissed
	if ( lastDismissTime === 0 ) {
		return false;
	}

	if ( getGoogleMyBusinessStatsNudgeDismissCount( state, siteId ) >= MAX_DISMISS ) {
		return true;
	}

	return lastDismissTime > Date.now() - 2 * WEEK_IN_MS;
}
