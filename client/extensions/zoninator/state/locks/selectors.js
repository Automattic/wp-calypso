/**
 * External dependencies
 */

import { get } from 'lodash';

const getLocksState = state => get( state, 'extensions.zoninator.locks', {} );

/**
 * Returns true if a zone is currently blocked by another user.
 *
 * @param  {object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Number}  zoneId Zone ID
 * @return {Boolean}        Blocked status
 */
export const blocked = ( state, siteId, zoneId ) =>
	get( getLocksState( state ), [ siteId, zoneId, 'blocked' ], false );

/**
 * Returns the time when the lock was created
 *
 * @param  {object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @param  {Number} zoneId Zone ID
 * @return {Number}        Lock creation date
 */
export const created = ( state, siteId, zoneId ) =>
	get( getLocksState( state ), [ siteId, zoneId, 'created' ], 0 );

/**
 * Returns the lock's expiration time in milliseconds
 *
 * @param  {object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @param  {Number} zoneId Zone ID
 * @return {Number}        Lock expiration time
 */
export const expires = ( state, siteId, zoneId ) =>
	get( getLocksState( state ), [ siteId, zoneId, 'expires' ], 0 );

/**
 * Returns the max lock period for a zone
 *
 * @param  {object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @param  {Number} zoneId Zone ID
 * @return {Number}        Maximum lock period in miliseconds
 */
export const maxLockPeriod = ( state, siteId, zoneId ) =>
	get( getLocksState( state ), [ siteId, zoneId, 'maxLockPeriod' ], 0 );
