import moment, { Moment } from 'moment';
import getHostingTrialExpiration from './get-hosting-trial-expiration';
import type { AppState } from 'calypso/types';

/**
 * Get the number of days left in the hosting trial. If the trial is not active, returns null.
 * @param {AppState} state - Global state tree
 * @param {number} siteId - Site ID
 * @returns {null|number} Number of days left in the trial as a float, or null if the trial is not active.
 */
export default function getHostingTrialDaysLeft( state: AppState, siteId: number ): number | null {
	const trialExpirationDate: Moment | null = getHostingTrialExpiration( state, siteId );
	if ( ! trialExpirationDate ) {
		return null;
	}

	return trialExpirationDate.diff( moment().utc(), 'days', true );
}
