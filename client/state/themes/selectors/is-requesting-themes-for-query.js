import { getSerializedThemesQuery } from 'calypso/state/themes/utils';

import 'calypso/state/themes/init';

/**
 * Returns true if currently requesting themes for the themes query, or false
 * otherwise.
 * @param  {Object}  state  Global state tree
 * @param  {number|string}  siteId Site ID or theme source (e.g. 'wpcom', 'wporg')
 * @param  {Object}  query  Theme query object
 * @returns {boolean}        Whether themes are being requested
 */
export function isRequestingThemesForQuery( state, siteId, query ) {
	const serializedQuery = getSerializedThemesQuery( query, siteId );
	return !! state.themes.queryRequests[ serializedQuery ];
}
