/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns the checklist for the specified site ID
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Object}        Site settings
 */
export default function getSiteChecklist( state, siteId ) {
	return get( state.checklist, [ siteId, 'items' ], null );
}
