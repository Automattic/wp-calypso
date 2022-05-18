import { planHasFeature, WPCOM_FEATURES_ATOMIC } from '@automattic/calypso-products';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getByPurchaseId } from './get-by-purchase-id';
import { getSitePurchases } from './get-site-purchases';

import 'calypso/state/purchases/init';

/**
 * Whether a purchase will trigger an Atomic revert when it is canceled or removed.
 * The backend has the final say on if this actually happens, see:
 * revert_atomic_site_on_subscription_removal() and deactivate_product().
 * This is a helper for UI elements only, it does not control actual revert decisions.
 *
 * @param   {object} state       global state
 * @param   {number} purchaseId  the purchase id
 * @returns {boolean} True if the Atomic revert will happen, false otherwise.
 */
export const willAtomicSiteRevertAfterPurchaseDeactivation = ( state, purchaseId ) => {
	if ( ! purchaseId ) {
		return false;
	}

	const purchase = getByPurchaseId( state, purchaseId );

	const isAtomicSupportedProduct = ( productSlug ) =>
		planHasFeature( productSlug, WPCOM_FEATURES_ATOMIC );

	if (
		! purchase ||
		! isSiteAutomatedTransfer( state, purchase.siteId ) ||
		! isAtomicSupportedProduct( purchase.productSlug )
	) {
		return false;
	}

	// Retrieves all Atomic supported purchases for the site.
	// If there is at least one active subscription except the given one,
	// the site will be kept in the Atomic infra.
	return ! getSitePurchases( state, purchase.siteId ).some(
		( sitePurchase ) =>
			sitePurchase.id !== purchaseId && isAtomicSupportedProduct( sitePurchase.productSlug )
	);
};
