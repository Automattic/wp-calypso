/** @format */

/**
 * Internal dependencies
 */
import { getUserPurchases } from 'state/purchases/selectors';

/**
 * Return the details of any premium themes the user has purchased
 * @param  {Object}  state       global state
 * @param  {Number}  userId      the user id
 * @return {Array} Details of any premium themes the user has purchased
 */
export const getUserPurchasedPremiumThemes = ( state, userId ) => {
	if ( ! state.purchases.hasLoadedUserPurchasesFromServer ) {
		return false;
	}

	return getUserPurchases( state, userId ).filter(
		purchase => purchase.productSlug === 'premium_theme'
	);
};

export default getUserPurchasedPremiumThemes;
