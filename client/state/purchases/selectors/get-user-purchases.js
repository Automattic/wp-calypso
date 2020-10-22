/**
 * Internal Dependencies
 */
import { getPurchases } from './get-purchases';

import 'calypso/state/purchases/init';

/**
 * Returns a list of Purchases associated with a User from the state using its userId
 *
 * @param   {object} state       global state
 * @param   {number} userId      the user id
 * @returns {object} the matching purchases if there are some
 */
export const getUserPurchases = ( state, userId ) =>
	state.purchases.hasLoadedUserPurchasesFromServer &&
	getPurchases( state ).filter( ( purchase ) => purchase.userId === userId );
