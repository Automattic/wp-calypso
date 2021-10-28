import { planMatches, GROUP_WPCOM, TYPE_BUSINESS } from '@automattic/calypso-products';
import { getUserPurchases } from 'calypso/state/purchases/selectors';

/**
 * Returns a boolean flag indicating if the current user is a business plan user.
 *
 * @param {object}   state Global state tree
 * @returns {boolean} If the current user is a business plan user.
 */
export default function isBusinessPlanUser( state ) {
	const purchases = getUserPurchases( state );
	return (
		purchases &&
		purchases.some( ( purchase ) =>
			planMatches( purchase.productSlug, { group: GROUP_WPCOM, type: TYPE_BUSINESS } )
		)
	);
}
