/**
 * Internal dependencies
 */
import { PLAN_BUSINESS } from 'lib/plans/constants';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getUserPurchases } from 'state/purchases/selectors';

/**
 * Returns a boolean flag indicating if the current user is a business plan user.
 *
 * @param {Object}   state Global state tree
 * @return {Boolean} If the current user is a business plan user.
 */
export default ( state ) => {
	const userId = getCurrentUserId( state );

	if ( ! userId ) {
		return false;
	}

	const purchases = getUserPurchases( state, userId );

	if ( ! purchases || 0 === purchases.length ) {
		return false;
	}

	return purchases.some( ( purchase ) => PLAN_BUSINESS === purchase.productSlug );
};
