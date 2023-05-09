import type { Purchase } from 'calypso/lib/purchases/types';

export const isUserPurchaseOwner = ( userId?: number | null ) => ( purchase?: Purchase ) => {
	if ( ! userId || ! purchase ) {
		return false;
	}

	return purchase.userIsOwner || userId === purchase.userId;
};
