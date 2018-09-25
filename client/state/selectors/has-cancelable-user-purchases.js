/** @format */

/**
 * Internal dependencies
 */
import { getUserPurchases } from 'state/purchases/selectors';

/**
 * Does the user have any current purchases that can be canceled (i.e. purchases other than premium themes)?
 *
 * Note: there is an is_cancelable flag on the purchase object, but it doesn't appear to be reliable.
 *
 * @param  {Object}  state       global state
 * @param  {Number}  userId      the user id
 * @return {Boolean} if the user currently has any purchases that can be canceled.
 */
export const hasCancelableUserPurchases = ( state, userId ) => {
	if ( ! state.purchases.hasLoadedUserPurchasesFromServer ) {
		return false;
	}

	const purchases = getUserPurchases( state, userId ).filter(
		purchase => purchase.productSlug !== 'premium_theme'
	);

	return purchases && purchases.length > 0;
};

export default hasCancelableUserPurchases;
