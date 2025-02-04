import { PLAN_ECOMMERCE_TRIAL_MONTHLY } from '@automattic/calypso-products';
import moment, { Moment } from 'moment';
import { SitePlanData } from 'calypso/my-sites/checkout/src/hooks/product-variants';
import { getCurrentPlan } from '..';
import type { AppState } from 'calypso/types';

/**
 * Checks if the plan is an ecommerce trial.
 * @param {SitePlanData} plan - Plan object
 * @returns {boolean} returns true if the plan is an ecommerce trial
 */
function isECommerceTrialPlan( plan: SitePlanData ): boolean {
	return plan.productSlug === PLAN_ECOMMERCE_TRIAL_MONTHLY;
}

/**
 * Returns the expiration date of the ECommerce trial. If the trial is not active, returns null.
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
