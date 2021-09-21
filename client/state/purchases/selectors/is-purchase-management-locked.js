import { getByPurchaseId } from 'calypso/state/purchases/selectors/get-by-purchase-id';
import { shouldRevertAtomicSiteBeforeDeactivation } from 'calypso/state/purchases/selectors/should-revert-atomic-site-before-deactivation';
import getBlogStickers from 'calypso/state/selectors/get-blog-stickers';

export const isPurchaseManagementLocked = ( state, purchaseId ) => {
	if ( ! purchaseId ) {
		return false;
	}

	const purchase = getByPurchaseId( state, purchaseId );
	if ( ! purchase ) {
		return false;
	}

	const stickers = getBlogStickers( state, purchase.siteId ) || [];

	return (
		shouldRevertAtomicSiteBeforeDeactivation( state, purchaseId ) &&
		stickers.includes( 'subscription_deactivation_locked' )
	);
};
