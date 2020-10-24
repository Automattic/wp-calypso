/**
 * Internal Dependencies
 */
import { getUserPurchases } from './get-user-purchases';

import 'calypso/state/purchases/init';

/**
 * Does the user have any current purchases?
 *
 * @param   {object}  state       global state
 * @param   {number}  userId      the user id
 * @returns {boolean} if the user currently has any purchases.
 */
export const isUserPaid = ( state, userId ) =>
	state.purchases.hasLoadedUserPurchasesFromServer && 0 < getUserPurchases( state, userId ).length;
