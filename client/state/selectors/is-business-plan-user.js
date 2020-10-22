/**
 * Internal dependencies
 */

import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getUserPurchases } from 'calypso/state/purchases/selectors';
import { planMatches } from 'calypso/lib/plans';
import { GROUP_WPCOM, TYPE_BUSINESS } from 'calypso/lib/plans/constants';

/**
 * Returns a boolean flag indicating if the current user is a business plan user.
 *
 * @param {object}   state Global state tree
 * @returns {boolean} If the current user is a business plan user.
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

	return purchases.some( ( purchase ) =>
		planMatches( purchase.productSlug, { group: GROUP_WPCOM, type: TYPE_BUSINESS } )
	);
};
