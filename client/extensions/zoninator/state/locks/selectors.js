/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

const getLocksState = state => get( state, 'extensions.zoninator.locks', {} );

/**
 * Returns the lock information for the specified site and zone IDs.
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @param  {Number} zoneId Zone ID
 * @return {Object}        Lock
 */
export const getLock = ( state, siteId, zoneId ) =>
	get( getLocksState( state ), [ 'items', siteId, zoneId ], null );
