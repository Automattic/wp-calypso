import { PLAN_ECOMMERCE_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { getPurchases } from 'calypso/state/purchases/selectors';
import type { AppState } from 'calypso/types';

/**
 * Checks whether the current site is on the Woo Trial period.
 *
 * @param {AppState} state Global state tree
 * @returns {?boolean} Returns true if the site is on the trial period
 */
export default function isSiteOnWooExpressTrialPeriod( state: AppState ) {
	return !! getPurchases( state ).find(
		( purchase ) => purchase.productSlug === PLAN_ECOMMERCE_TRIAL_MONTHLY
	);
}
