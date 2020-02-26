/**
 * Internal dependencies
 */
import { getSerializedThemesQuery } from 'state/themes/utils';

import 'state/themes/init';

/**
 * Returns true if currently requesting themes for the themes query, or false
 * otherwise.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @param  {object}  query  Theme query object
 * @returns {boolean}        Whether themes are being requested
 */
export function isRequestingThemesForQuery( state, siteId, query ) {
	const serializedQuery = getSerializedThemesQuery( query, siteId );
	return !! state.themes.queryRequests[ serializedQuery ];
}
