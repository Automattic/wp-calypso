import {
	PLAN_WOOEXPRESS_MEDIUM,
	PLAN_WOOEXPRESS_MEDIUM_MONTHLY,
	PLAN_WOOEXPRESS_SMALL,
	PLAN_WOOEXPRESS_SMALL_MONTHLY,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_MONTHLY,
	PLAN_ECOMMERCE_2_YEARS,
	PLAN_ECOMMERCE_3_YEARS,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
} from '@automattic/calypso-products';
import { getSite } from 'calypso/state/sites/selectors';
import { getCurrentPlan } from '.';
import type { AppState } from 'calypso/types';

/**
 * Checks whether the current site is on a Woo Express, paid Ecommerce,
 * or Ecommerce free trial plan.
 * @param {AppState} state Global state tree
 * @param {number} siteId - Site ID
 * @returns {boolean} Returns true if the site matches the criteria
 */
export default function isSiteOnWooExpressEcommerceTrial( state: AppState, siteId: number ) {
	const currentPlan = getCurrentPlan( state, siteId );
	const site = getSite( state, siteId );
	const plans = [
		// Woo Express plans
		PLAN_WOOEXPRESS_MEDIUM,
		PLAN_WOOEXPRESS_SMALL,
		PLAN_WOOEXPRESS_MEDIUM_MONTHLY,
		PLAN_WOOEXPRESS_SMALL_MONTHLY,

		// Ecommerce plans
		PLAN_ECOMMERCE,
		PLAN_ECOMMERCE_MONTHLY,
		PLAN_ECOMMERCE_2_YEARS,
		PLAN_ECOMMERCE_3_YEARS,

		// Free trial
		PLAN_ECOMMERCE_TRIAL_MONTHLY,
	];

	const productSlug = currentPlan?.productSlug || site?.plan?.product_slug;

	return productSlug && plans.includes( productSlug );
}
