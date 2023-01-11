import moment, { Moment } from 'moment';
import { AppState } from 'calypso/types';
import getWooExpressTrialExpiration from './get-woo-express-trial-expiration';

/**
 * Get the number of days left in the Woo Express trial. If the trial is not active, returns null.
 *
 * @param {AppState} state - Global state tree
 * @returns {null|number} Number of days left in the trial, or null if the trial is not active.
 */
export default function getWooExpressTrialDaysLeft( state: AppState ): number | null {
	const trialExpirationDate: Moment | null = getWooExpressTrialExpiration( state );
	if ( ! trialExpirationDate ) {
		return null;
	}

	return trialExpirationDate.diff( moment().utc(), 'days', true );
}
