import { STATS_PAID_STATS_UPSELL_MODAL_TOGGLE } from 'calypso/state/action-types';
import 'calypso/state/stats/init';

/**
 * Toggles the paid stats upsell modal.
 * @param  {number}  siteId Site ID
 * @param  {string}  statType Stat type
 * @returns {Object} Action object
 */

export function toggleUpsellModal( siteId: number | null, statType: string ) {
	return {
		type: STATS_PAID_STATS_UPSELL_MODAL_TOGGLE,
		siteId,
		payload: { statType },
	};
}
