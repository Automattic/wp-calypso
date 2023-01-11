import { AppState } from 'calypso/types';
import getWooExpressTrialDaysLeft from './get-woo-express-trial-days-left';

/**
 * Returns true if the Woo Express trial has expired. If the trial is not active, returns null.
 *
 * @param {AppState} state - Global state tree
 * @param {number} siteId - Site ID
 * @returns {boolean|null}
 */
export default function isWooExpressTrialExpired(
	state: AppState,
	siteId: number
): boolean | null {
	const trialDaysLeft = getWooExpressTrialDaysLeft( state, siteId );

	if ( trialDaysLeft === null ) {
		return null;
	}

	return trialDaysLeft <= 0;
}
