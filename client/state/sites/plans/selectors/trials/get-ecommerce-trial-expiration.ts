import moment, { Moment } from 'moment';
import { SitePlanData } from 'calypso/my-sites/checkout/composite-checkout/hooks/product-variants';
import { getCurrentPlan } from '..';
import { isECommerceTrialPlan } from './is-trial-plan';
import type { AppState } from 'calypso/types';

/**
 * Returns the expiration date of the ECommerce trial. If the trial is not active, returns null.
 *
 * @param {AppState} state - Global state tree
 * @param {number} siteId - Site ID
 * @returns {Moment|null} Expiration date of the trial, or null if the trial is not active.
 */
export default function getECommerceTrialExpiration(
	state: AppState,
	siteId: number
): Moment | null {
	const currentPlan = getCurrentPlan( state, siteId );
	if ( ! currentPlan || ! isECommerceTrialPlan( currentPlan as SitePlanData ) ) {
		return null;
	}

	return moment.utc( currentPlan.expiryDate );
}
