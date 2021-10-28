import { getUserPurchases } from 'calypso/state/purchases/selectors';

import 'calypso/state/purchases/init';

/**
 * Return the details of any premium themes the user has purchased
 *
 * @param  {object}  state       global state
 * @returns {Array} Details of any premium themes the user has purchased
 */
export const getUserPurchasedPremiumThemes = ( state ) => {
	if ( ! state.purchases.hasLoadedUserPurchasesFromServer ) {
		return false;
	}

	return getUserPurchases( state ).filter(
		( purchase ) => purchase.productSlug === 'premium_theme'
	);
};

export default getUserPurchasedPremiumThemes;
