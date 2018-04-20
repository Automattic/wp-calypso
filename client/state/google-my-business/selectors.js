/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

export function getInterval( state, siteId, statType ) {
	return get( state.googleMyBusiness, [ siteId, 'statInterval', statType ], 'week' );
}
