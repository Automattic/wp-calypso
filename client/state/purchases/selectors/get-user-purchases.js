import { createSelector } from '@automattic/state-utils';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getPurchases } from './get-purchases';

import 'calypso/state/purchases/init';

/**
 * Returns a list of purchases associated with the current user
 *
 * @param   {object} state       global state
 * @returns {Array.<object>} the matching purchases if there are some
 */
export const getUserPurchases = createSelector(
	( state ) => {
		if ( ! state.purchases.hasLoadedUserPurchasesFromServer ) {
			return null;
		}

		const userId = getCurrentUserId( state );
		return getPurchases( state ).filter( ( purchase ) => purchase.userId === userId );
	},
	( state ) => [ getCurrentUserId( state ), getPurchases( state ) ]
);
