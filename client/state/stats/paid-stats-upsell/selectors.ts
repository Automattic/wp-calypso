import { get } from 'lodash';

import 'calypso/state/stats/init';

/**
 * Returns the current view state of the upsell modal.
 */
export function getUpsellModalView( state: object, siteId: number ) {
	return get( state, [ 'stats', 'paidStatsUpsell', 'data', siteId, 'view' ], false );
}

export function getUpsellModalStatType( state: object, siteId: number ) {
	return get( state, [ 'stats', 'paidStatsUpsell', 'data', siteId, 'statType' ], null );
}
