import moment, { Moment } from 'moment';
import { AppState } from 'calypso/types';
import getECommerceTrialExpiration from './get-ecommerce-trial-expiration';

/**
 * Get the number of full days left in the ECommerce trial. If the trial is not active, returns null.
 *
 * @param {AppState} state - Global state tree
 * @param {number} siteId - Site ID
 * @returns {null|number} Number of days left in the trial, or null if the trial is not active.
 */
export default function getECommerceTrialDaysLeft(
	state: AppState,
	siteId: number
): number | null {
	const trialExpirationDate: Moment | null = getECommerceTrialExpiration( state, siteId );
	if ( ! trialExpirationDate ) {
		return null;
	}

	// Use Math.floor() so we get an integer number of days.
	// The result of diff() will include partial days, like 13.7, which is not
	// a useful return value from this function.
	return Math.floor( trialExpirationDate.diff( moment().utc(), 'days', true ) );
}
