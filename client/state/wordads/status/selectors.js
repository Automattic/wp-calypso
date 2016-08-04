/**
 * External dependencies
 */

import get from 'lodash/get';

export function siteWordadsUnsafe( state, siteId ) {
	return get( state, [ 'wordads', 'status', 'items', siteId, 'unsafe' ], false );
}

export function isRequestingWordadsStatus( state, siteId ) {
	return !! state.wordads.status.fetchingItems[ siteId ];
}
