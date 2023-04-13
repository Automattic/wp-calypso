import { planHasFeature, WPCOM_FEATURES_ATOMIC } from '@automattic/calypso-products';
import { isMarketplaceProduct } from 'calypso/state/products-list/selectors';
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
 * @param   {Object} state           global state
 * @param   {number} purchaseId      the purchase id
 * @param   {Array}  linkedPurchases List of purchases that will be also deactivated because they are
 *                                   linked to the given purchase
 * @returns {boolean} True if the Atomic revert will happen, false otherwise.
 */
export const willAtomicSiteRevertAfterPurchaseDeactivation = (
	state,
	purchaseId,
	linkedPurchases
) => {
	if ( ! purchaseId ) {
		return false;
	}

	const purchase = getByPurchaseId( state, purchaseId );
	if ( ! purchase ) {
		return false;
	}

	// Bail if the site not Atomic.
	if ( ! isSiteAutomatedTransfer( state, purchase.siteId ) ) {
		return false;
	}

	const isAtomicSupportedProduct = ( productSlug ) => {
		if ( isMarketplaceProduct( state, productSlug ) ) {
			return true;
		}

		return planHasFeature( productSlug, WPCOM_FEATURES_ATOMIC );
	};

	if ( ! Array.isArray( linkedPurchases ) ) {
		linkedPurchases = [];
	}

	// Bail if none of the purchases to deactivate supports Atomic.
	if (
		! isAtomicSupportedProduct( purchase.productSlug ) &&
		linkedPurchases.every(
			( linkedPurchase ) => ! isAtomicSupportedProduct( linkedPurchase.productSlug )
		)
	) {
		return false;
	}

	const remainingPurchases = getSitePurchases( state, purchase.siteId ).filter(
		( sitePurchase ) =>
			sitePurchase.id !== purchaseId &&
			linkedPurchases.every( ( linkedPurchase ) => sitePurchase.id !== linkedPurchase.id )
	);

	// If there is at least one remaining Atomic supported purchase, the site will be kept in the Atomic infra.
	return ! remainingPurchases.some( ( sitePurchase ) =>
		isAtomicSupportedProduct( sitePurchase.productSlug )
	);
};
