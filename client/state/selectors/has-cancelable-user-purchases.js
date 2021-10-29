import { getUserPurchases } from 'calypso/state/purchases/selectors';

import 'calypso/state/purchases/init';

/**
 * Does the user have any current purchases that can be canceled (i.e. purchases other than premium themes)?
 *
 * Note: there is an is_cancelable flag on the purchase object, but it returns true for premium themes.
 *
 * @param  {object}  state       global state
 * @returns {boolean} if the user currently has any purchases that can be canceled.
 */
export const hasCancelableUserPurchases = ( state ) => {
	const purchases = getUserPurchases( state );
	return (
		purchases &&
		purchases.some(
			( purchase ) => purchase.isRefundable || purchase.productSlug !== 'premium_theme'
		)
	);
};

export default hasCancelableUserPurchases;
