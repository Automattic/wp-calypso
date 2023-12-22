import { get } from 'lodash';

import 'calypso/state/stats/init';

/**
 * Returns the current view state of the upsell modal.
 */
export function getUpsellModalView( state: object, siteSlug: string ) {
	return get( state, [ 'stats', 'paidStatsUpsell', 'data', siteSlug, 'view' ], false );
}

export function getUpsellModalStatType( state: object, siteSlug: string ) {
	return get( state, [ 'stats', 'paidStatsUpsell', 'data', siteSlug, 'statType' ], null );
}
