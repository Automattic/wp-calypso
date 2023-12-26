import { STATS_PAID_STATS_UPSELL_MODAL_TOGGLE } from 'calypso/state/action-types';
import 'calypso/state/data-layer/wpcom/sites/stats/module-toggles';
import 'calypso/state/stats/init';

/**
 * Returns an action thunk which, when invoked, triggers a network request to
 * retrieve stats module toggles data.
 * @param  {number}  siteId Site ID
 * @returns {Object}  Action object
 */

export function toggleUpsellModal( siteId: number, statType: string ) {
	return {
		type: STATS_PAID_STATS_UPSELL_MODAL_TOGGLE,
		siteId,
		payload: { statType },
	};
}
