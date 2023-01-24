import { createSelector } from '@automattic/state-utils';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { hasLoadedUserPurchasesFromServer } from './fetching';
import { getPurchases } from './get-purchases';
import 'calypso/state/purchases/init';

/**
 * Returns a list of purchases associated with the current user
 *
 * @param {Object} state Redux state
 * @returns {Array|null} array of the matching purchases or `null` if the list hasn't been loaded from server yet
 */
export const getUserPurchases = createSelector(
	( state ) => {
		if ( ! hasLoadedUserPurchasesFromServer( state ) ) {
			return null;
		}

		const userId = getCurrentUserId( state );
		return getPurchases( state ).filter( ( purchase ) => purchase.userId === userId );
	},
	( state ) => [
		hasLoadedUserPurchasesFromServer( state ),
		getCurrentUserId( state ),
		getPurchases( state ),
	]
);
