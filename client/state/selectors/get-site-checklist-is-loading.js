/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns the loading state for the checklist API call
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Bool}    Whether the checklist is loading
 */
export default function getSiteChecklistIsLoading( state, siteId ) {
	return get( state.checklist, [ siteId, 'isLoading' ], false );
}
