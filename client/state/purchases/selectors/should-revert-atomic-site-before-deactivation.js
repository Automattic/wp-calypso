import { isAtomicSupportedProduct } from '@automattic/calypso-products';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getByPurchaseId } from './get-by-purchase-id';
import { getSitePurchases } from './get-site-purchases';

import 'calypso/state/purchases/init';

/**
 * Whether a purchase needs to trigger an Atomic revert prior its cancellation/removal.
 *
 * @param   {object} state       global state
 * @param   {number} purchaseId  the purchase id
 * @returns {boolean} True if the Atomic revert is needed, false otherwise.
 */
export const shouldRevertAtomicSiteBeforeDeactivation = ( state, purchaseId ) => {
	if ( ! purchaseId ) {
		return false;
	}

	const purchase = getByPurchaseId( state, purchaseId );

	if (
		! purchase ||
		! isSiteAutomatedTransfer( state, purchase.siteId ) ||
		! isAtomicSupportedProduct( purchase.productSlug )
	) {
		return false;
	}

	// Retrieves all Atomic supported purchases for the site.
	// If there is at least one active subscription except the given one,
	// the site needs to be kept in the Atomic infra.
	return ! getSitePurchases( state, purchase.siteId ).some(
		( sitePurchase ) =>
			sitePurchase.id !== purchaseId && isAtomicSupportedProduct( sitePurchase.productSlug )
	);
};
