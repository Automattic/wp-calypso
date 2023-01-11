import { AppState } from 'calypso/types';
import getWooExpressTrialExpiration from './get-woo-express-trial-expiration';

/**
 * Get the number of days left in the Woo Express trial. If the trial is not active, returns null.
 *
 * @param {AppState} state - Global state tree
 * @returns {null|number} Number of days left in the trial, or null if the trial is not active.
 */
export default function getWooExpressTrialDaysLeft( state: AppState ): number | null {
	const trialExpirationDate = getWooExpressTrialExpiration( state );
	if ( ! trialExpirationDate ) {
		return null;
	}

	const expiryDate = +new Date( trialExpirationDate );
	const diffTime = expiryDate - +new Date();
	const diffDays = Math.ceil( diffTime / ( 1000 * 60 * 60 * 24 ) );
	return diffDays;
}
