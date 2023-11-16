import {
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_2_YEARS,
	PLAN_ECOMMERCE_3_YEARS,
	PLAN_ECOMMERCE_MONTHLY,
} from '@automattic/calypso-products';
import { getCurrentPlan } from '..';
import type { AppState } from 'calypso/types';

/**
 * Checks whether the current site is on a paid Ecommerce plan.
 * @param {AppState} state Global state tree
 * @param {number} siteId - Site ID
 * @returns {boolean} Returns true if the site is on a paid Ecommerce plan
 */
export default function isSiteOnEcommerce( state: AppState, siteId: number ): boolean {
	const currentPlan = getCurrentPlan( state, siteId );
	const ecommercePlans = [
		PLAN_ECOMMERCE,
		PLAN_ECOMMERCE_MONTHLY,
		PLAN_ECOMMERCE_2_YEARS,
		PLAN_ECOMMERCE_3_YEARS,
	];

	if ( ! currentPlan ) {
		return false;
	}

	return ecommercePlans.includes( currentPlan.productSlug );
}
