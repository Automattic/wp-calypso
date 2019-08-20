/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

export default function getSiteThreats( state, siteId ) {
	return get( state, [ 'rewind', siteId, 'alerts', 'threats' ], [] );
}
