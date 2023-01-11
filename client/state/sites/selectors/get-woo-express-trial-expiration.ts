import { PLAN_ECOMMERCE_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { getPurchases } from 'calypso/state/purchases/selectors';
import type { AppState } from 'calypso/types';

/**
 * Returns the expiration date of the Woo Express trial. If the trial is not active, returns null.
 *
 * @param {AppState} state - Global state tree
 * @returns {string|null}
 */
export default function getWooExpressTrialExpiration( state: AppState ) {
	const trialPurchase = getPurchases( state ).find(
		( purchase ) => purchase.productSlug === PLAN_ECOMMERCE_TRIAL_MONTHLY
	);

	if ( ! trialPurchase ) {
		return null;
	}

	return trialPurchase.expiryDate;
}
