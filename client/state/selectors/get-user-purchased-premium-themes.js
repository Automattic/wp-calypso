import { getUserPurchases } from 'calypso/state/purchases/selectors';

import 'calypso/state/purchases/init';

/**
 * Return the details of any premium themes the user has purchased
 *
 * @param  {object}  state       global state
 * @returns {Array} Details of any premium themes the user has purchased
 */
export const getUserPurchasedPremiumThemes = ( state ) => {
	const purchases = getUserPurchases( state );
	return purchases && purchases.filter( ( purchase ) => purchase.productSlug === 'premium_theme' );
};

export default getUserPurchasedPremiumThemes;
