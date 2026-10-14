import type { Purchase } from '@automattic/api-core';

export const isUserPurchaseOwner = ( userId?: number | null ) => ( purchase?: Purchase ) => {
	if ( ! userId || ! purchase ) {
		return false;
	}

	return userId === purchase.user_id;
};
