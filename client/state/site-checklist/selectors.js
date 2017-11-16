/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns true if we are requesting settings for the specified site ID, false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}        Whether site settings is being requested
 */
export function isRequestingSiteChecklist( state, siteId ) {
	return get( state.siteSettings.requesting, [ siteId ], false );
}
