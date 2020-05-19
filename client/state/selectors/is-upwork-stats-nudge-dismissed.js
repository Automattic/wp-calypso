/**
 * External dependencies
 */
import { last } from 'lodash';

/**
 * Internal dependencies
 */
import { getPreference } from 'state/preferences/selectors';

const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Returns the last time the nudge was dismissed by the current user or 0 if it was never dismissed
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId The Id of the site
 * @returns {number}  Timestamp marking the last time the nudge was dismissed
 */
const getLastDismissTime = ( state, siteId ) => {
	const preference = getPreference( state, 'upwork-dismissible-nudge' ) || {};
	const sitePreference = preference[ siteId ] || [];
	const lastEvent = last( sitePreference.filter( ( event ) => 'dismiss' === event.type ) );

	return lastEvent ? lastEvent.dismissedAt : 0;
};

/**
 * Returns true if the Upwork nudge has recently been dismissed by the current user
 * and this action is still effective for this site
 *
 * The conditions for it to be effective (and thus make the nudge invisible) are the following:
 * - The last time it was dismissed must be less than 2 weeks ago
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId The Id of the site
 * @returns {boolean} True if the nudge has been dismissed
 */
export default function isUpworkStatsNudgeDismissed( state, siteId ) {
	const lastDismissTime = getLastDismissTime( state, siteId );

	// Return false if it has never been dismissed
	if ( lastDismissTime === 0 ) {
		return false;
	}

	return lastDismissTime > Date.now() - 2 * WEEK_IN_MS;
}
