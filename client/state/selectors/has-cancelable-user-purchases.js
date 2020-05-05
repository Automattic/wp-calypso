/**
 * Internal dependencies
 */
import { getUserPurchases } from 'state/purchases/selectors';

/**
 * Does the user have any current purchases that can be canceled (i.e. purchases other than premium themes)?
 *
 * Note: there is an is_cancelable flag on the purchase object, but it returns true for premium themes.
 *
 * @param  {object}  state       global state
 * @param  {number}  userId      the user id
 * @returns {boolean} if the user currently has any purchases that can be canceled.
 */
export const hasCancelableUserPurchases = ( state, userId ) => {
	if ( ! state.purchases.hasLoadedUserPurchasesFromServer ) {
		return false;
	}

	const purchases = getUserPurchases( state, userId ).filter( ( purchase ) => {
		if ( purchase.isRefundable ) {
			return true;
		}

		return purchase.productSlug !== 'premium_theme';
	} );

	return purchases && purchases.length > 0;
};

export default hasCancelableUserPurchases;
