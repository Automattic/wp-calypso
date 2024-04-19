import { Purchase } from 'calypso/lib/purchases/types';
import { getByPurchaseId } from 'calypso/state/purchases/selectors';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import getSelectedSiteId from './get-selected-site-id';
import type { AppState } from 'calypso/types';

/**
 * Returns the site object for the currently selected site.
 */
export default function getSelectedPurchase( state: AppState ): Purchase | null | undefined {
	const selectedSiteId = getSelectedSiteId( state );
	const currentPlan = getCurrentPlan( state, selectedSiteId );
	if ( ! currentPlan?.id ) {
		return null;
	}
	return getByPurchaseId( state, currentPlan.id );
}
