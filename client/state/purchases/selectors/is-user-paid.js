import { getUserPurchases } from './get-user-purchases';

import 'calypso/state/purchases/init';

/**
 * Does the user have any current purchases?
 *
 * @param   {Object}  state       global state
 * @returns {boolean} if the user currently has any purchases.
 */
export const isUserPaid = ( state ) => {
	const purchases = getUserPurchases( state );
	return purchases && purchases.length > 0;
};
