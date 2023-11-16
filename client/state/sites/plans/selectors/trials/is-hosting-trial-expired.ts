import { AppState } from 'calypso/types';
import getHostingTrialDaysLeft from './get-hosting-trial-days-left';

/**
 * Returns true if the hosting trial has expired. If the trial is not active, returns null.
 * @param {AppState} state - Global state tree
 * @param {number} siteId - Site ID
 * @returns {boolean|null}
 */
export default function isHostingTrialExpired( state: AppState, siteId: number ): boolean | null {
	const trialDaysLeft = getHostingTrialDaysLeft( state, siteId );

	if ( trialDaysLeft === null ) {
		return null;
	}

	return trialDaysLeft <= 0;
}
