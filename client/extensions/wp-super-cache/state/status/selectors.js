/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns true if we are requesting status for the specified site ID, false otherwise.
 *
 * @param  {Object}  state Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean} Whether status are being requested
 */
export function isRequestingStatus( state, siteId ) {
	return get( state, [ 'extensions', 'wpSuperCache', 'status', 'requesting', siteId ], false );
}

/**
 * Returns the status for the specified site ID.
 *
 * @param  {Object} state Global state tree
 * @param  {Number} siteId Site ID
 * @return {Object} Status
 */
export function getStatus( state, siteId ) {
	return get( state, [ 'extensions', 'wpSuperCache', 'status', 'items', siteId ], {} );
}
