import { getRawUserPurchases } from 'calypso/state/purchases/selectors';

import 'calypso/state/purchases/init';

/**
 * Return the details of any premium themes the user has purchased
 * @param  {Object}  state       global state
 * @returns {Array} Details of any premium themes the user has purchased
 */
export const getUserPurchasedPremiumThemes = ( state ) => {
	const purchases = getRawUserPurchases( state );
	return purchases && purchases.filter( ( purchase ) => purchase.product_type === 'theme' );
};

export default getUserPurchasedPremiumThemes;
