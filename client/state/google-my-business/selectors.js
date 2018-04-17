/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

export function getInterval( state, siteId, statType ) {
	return get( state.googleMyBusiness, [ siteId, 'statInterval', statType ], 'week' );
}

export const getGoolgeMyBusinessSiteStats = ( state, siteId, statType, interval, aggregation ) =>
	get( state, [ 'googleMyBusiness', siteId, 'stats', statType, interval, aggregation ], null );
