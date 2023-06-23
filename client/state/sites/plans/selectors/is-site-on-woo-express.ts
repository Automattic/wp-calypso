import {
	PLAN_WOOEXPRESS_MEDIUM,
	PLAN_WOOEXPRESS_MEDIUM_MONTHLY,
	PLAN_WOOEXPRESS_SMALL,
	PLAN_WOOEXPRESS_SMALL_MONTHLY,
} from '@automattic/calypso-products';
import { getSite } from 'calypso/state/sites/selectors';
import type { AppState } from 'calypso/types';

/**
 * Checks whether the current site is on a Woo Express plan.
 *
 * @param {AppState} state Global state tree
 * @param {number} siteId - Site ID
 * @returns {boolean} Returns true if the site is on a Woo Express plan
 */
export default function isSiteOnWooExpress( state: AppState, siteId: number ) {
	const site = getSite( state, siteId );
	const wooExpressPlans = [
		PLAN_WOOEXPRESS_MEDIUM,
		PLAN_WOOEXPRESS_SMALL,
		PLAN_WOOEXPRESS_MEDIUM_MONTHLY,
		PLAN_WOOEXPRESS_SMALL_MONTHLY,
	];

	if ( ! site?.plan?.product_slug ) {
		return false;
	}

	return wooExpressPlans.includes( site.plan.product_slug );
}
