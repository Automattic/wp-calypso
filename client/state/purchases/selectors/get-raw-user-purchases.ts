import { createSelector } from '@automattic/state-utils';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { hasLoadedUserPurchasesFromServer } from './fetching';
import { getRawPurchases } from './get-raw-purchases';
import type { Purchase } from '@automattic/api-core';
import type { AppState } from 'calypso/types';

import 'calypso/state/purchases/init';

/**
 * Returns the current user's purchases in the snake_case API shape, or `null`
 * while the list has yet to load from the server.
 */
export const getRawUserPurchases = createSelector(
	( state: AppState ): Purchase[] | null => {
		if ( ! hasLoadedUserPurchasesFromServer( state ) ) {
			return null;
		}

		const userId = getCurrentUserId( state );
		return getRawPurchases( state ).filter( ( purchase ) => purchase.user_id === userId );
	},
	( state: AppState ) => [
		hasLoadedUserPurchasesFromServer( state ),
		getCurrentUserId( state ),
		getRawPurchases( state ),
	]
);
