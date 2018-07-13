/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

export function isSiteWordadsUnsafe( state, siteId ) {
	return get( state, [ 'wordads', 'status', 'items', siteId, 'unsafe' ], false );
}
