/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if we are requesting notices for the specified site ID, false otherwise.
 *
 * @param  {Object}  state Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean} Whether notices are being requested
 */
export function isRequestingNotices( state, siteId ) {
	return get( state, [ 'extensions', 'wpSuperCache', 'notices', 'requesting', siteId ], false );
}

/**
 * Returns the notices for the specified site ID.
 *
 * @param  {Object} state Global state tree
 * @param  {Number} siteId Site ID
 * @return {Object} Notices
 */
export function getNotices( state, siteId ) {
	return get( state, [ 'extensions', 'wpSuperCache', 'notices', 'items', siteId ], null );
}
