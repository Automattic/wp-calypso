import { createSelector } from '@automattic/state-utils';
import { Purchase } from 'calypso/lib/purchases/types';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { AppState } from 'calypso/types';
import { getByPurchaseId } from './get-by-purchase-id';

import 'calypso/state/purchases/init';

type PlanPurchase = Purchase & {
	userIsOwner?: boolean;
};

/**
 * Returns if the user owns the given purchase, false otherwise.
 *
 * @param {object} state Redux state
 * @param {number} purchaseId the Id of the purchase to check
 * @returns {boolean} true if we can definitely identify the user as the purchase owner, false in all other cases
 */
export const getUserOwnsPurchase = createSelector(
	( state: AppState, purchaseId: number ) => {
		const userId = getCurrentUserId( state );
		const purchase = getByPurchaseId( state, purchaseId ) as PlanPurchase;

		if ( userId === null || purchase === undefined ) {
			return false;
		}

		return purchase?.userIsOwner || userId === purchase?.userId;
	},
	( state, purchaseId ) => [ getCurrentUserId( state ), getByPurchaseId( state, purchaseId ) ]
);
