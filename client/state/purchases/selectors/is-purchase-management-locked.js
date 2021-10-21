import { getByPurchaseId } from 'calypso/state/purchases/selectors/get-by-purchase-id';

export const isPurchaseManagementLocked = ( state, purchaseId ) => {
	if ( ! purchaseId ) {
		return false;
	}

	const purchase = getByPurchaseId( state, purchaseId );
	if ( ! purchase ) {
		return false;
	}

	return purchase.isLocked;
};
