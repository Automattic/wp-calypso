import moment, { Moment } from 'moment';
import { AppState } from 'calypso/types';
import getWooExpressTrialExpiration from './get-woo-express-trial-expiration';

/**
 * Get the number of days left in the Woo Express trial. If the trial is not active, returns null.
 *
 * @param {AppState} state - Global state tree
 * @param {number} siteId - Site ID
 * @returns {null|number} Number of days left in the trial, or null if the trial is not active.
 */
export default function getWooExpressTrialDaysLeft(
	state: AppState,
	siteId: number
): number | null {
	const trialExpirationDate: Moment | null = getWooExpressTrialExpiration( state, siteId );
	if ( ! trialExpirationDate ) {
		return null;
	}

	return trialExpirationDate.diff( moment().utc(), 'days', true );
}
