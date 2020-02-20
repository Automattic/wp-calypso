/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns true if we are requesting status for the specified site ID, false otherwise.
 *
 * @param  {object}  state Global state tree
 * @param  {number}  siteId Site ID
 * @returns {boolean} Whether status are being requested
 */
export function isRequestingStatus( state, siteId ) {
	return get( state, [ 'extensions', 'wpSuperCache', 'status', 'requesting', siteId ], false );
}

/**
 * Returns the status for the specified site ID.
 *
 * @param  {object} state Global state tree
 * @param  {number} siteId Site ID
 * @returns {object} Status
 */
export function getStatus( state, siteId ) {
	return get( state, [ 'extensions', 'wpSuperCache', 'status', 'items', siteId ], {} );
}
