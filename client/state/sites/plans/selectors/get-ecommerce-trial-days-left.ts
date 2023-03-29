import moment, { Moment } from 'moment';
import { AppState } from 'calypso/types';
import getECommerceTrialExpiration from './get-ecommerce-trial-expiration';

/**
 * Get the number of days left in the ECommerce trial. If the trial is not active, returns null.
 *
 * @param {AppState} state - Global state tree
 * @param {number} siteId - Site ID
 * @returns {null|number} Exact number of days left in the trial, or null if the trial is not active.
 */
export default function getECommerceTrialDaysLeft(
	state: AppState,
	siteId: number
): number | null {
	const trialExpirationDate: Moment | null = getECommerceTrialExpiration( state, siteId );
	if ( ! trialExpirationDate ) {
		return null;
	}

	const currentTimeUtc = moment().utc();
	let startTimeUtc;

	// If the current time is 00:00:00.000 that should be our start time.
	if (
		currentTimeUtc.hour() === 0 &&
		currentTimeUtc.minute() === 0 &&
		currentTimeUtc.second() === 0 &&
		currentTimeUtc.millisecond() === 0
	) {
		startTimeUtc = currentTimeUtc.clone();
	} else {
		// We need start time to be 00:00:00.000 of the next day so we only count full days.
		startTimeUtc = currentTimeUtc
			.clone()
			.add( 1, 'days' )
			.hour( 0 )
			.minute( 0 )
			.second( 0 )
			.millisecond( 0 );
	}

	return trialExpirationDate.diff( startTimeUtc, 'days', true );
}
