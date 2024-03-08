import { AppState } from 'calypso/types';
import getECommerceTrialDaysLeft from './get-ecommerce-trial-days-left';

/**
 * Returns true if the ECommerce trial has expired. If the trial is not active, returns null.
 * @param {AppState} state - Global state tree
 * @param {number} siteId - Site ID
 * @returns {boolean|null}
 */
export default function isECommerceTrialExpired( state: AppState, siteId: number ): boolean | null {
	const trialDaysLeft = getECommerceTrialDaysLeft( state, siteId );

	if ( trialDaysLeft === null ) {
		return null;
	}

	return trialDaysLeft <= 0;
}
