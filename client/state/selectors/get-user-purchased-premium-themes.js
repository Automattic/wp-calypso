/**
 * Internal dependencies
 */
import { getUserPurchases } from 'state/purchases/selectors';

/**
 * Return the details of any premium themes the user has purchased
 *
 * @param  {object}  state       global state
 * @param  {number}  userId      the user id
 * @returns {Array} Details of any premium themes the user has purchased
 */
export const getUserPurchasedPremiumThemes = ( state, userId ) => {
	if ( ! state.purchases.hasLoadedUserPurchasesFromServer ) {
		return false;
	}

	return getUserPurchases( state, userId ).filter(
		( purchase ) => purchase.productSlug === 'premium_theme'
	);
};

export default getUserPurchasedPremiumThemes;
