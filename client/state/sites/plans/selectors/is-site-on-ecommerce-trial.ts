import { PLAN_ECOMMERCE_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { getCurrentPlan } from '.';
import type { AppState } from 'calypso/types';

/**
 * Checks whether the current site is on the Woo Trial.
 *
 * @param {AppState} state Global state tree
 * @param {number} siteId - Site ID
 * @returns {boolean} Returns true if the site is on the trial
 */
export default function isSiteOnECommerceTrial( state: AppState, siteId: number ) {
	const currentPlan = getCurrentPlan( state, siteId );

	if ( ! currentPlan ) {
		return false;
	}

	return currentPlan.productSlug === PLAN_ECOMMERCE_TRIAL_MONTHLY;
}
