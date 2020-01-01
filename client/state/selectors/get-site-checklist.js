/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns the checklist for the specified site ID
 *
 * @param  {object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {object}        Site settings
 */
export default function getSiteChecklist( state, siteId ) {
	return get( state.checklist, [ siteId, 'items' ], null );
}
