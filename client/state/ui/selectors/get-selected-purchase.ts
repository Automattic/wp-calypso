import { getRawByPurchaseId } from 'calypso/state/purchases/selectors/get-raw-by-purchase-id';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors/get-current-plan';
import getSelectedSiteId from './get-selected-site-id';
import type { Purchase } from '@automattic/api-core';
import type { AppState } from 'calypso/types';

/**
 * Returns the purchase object for the currently selected site.
 */
export default function getSelectedPurchase( state: AppState ): Purchase | null | undefined {
	const selectedSiteId = getSelectedSiteId( state );
	const currentPlan = getCurrentPlan( state, selectedSiteId );
	if ( ! currentPlan?.id ) {
		return null;
	}
	return getRawByPurchaseId( state, currentPlan.id );
}
