/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

export function getInterval( state, siteId, statType ) {
	return get( state.googleMyBusinessStats.statInterval, [ siteId, statType ], 'week' );
}
