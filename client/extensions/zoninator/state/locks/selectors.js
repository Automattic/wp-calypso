/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

const getLocksState = state => get( state, 'extensions.zoninator.locks', {} );

/**
 * Returns the lock expiration date for the specified site and zone IDs.
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @param  {Number} zoneId Zone ID
 * @return {Number}        Lock expiration date
 */
export const getLock = ( state, siteId, zoneId ) =>
	get( getLocksState( state ), [ 'items', siteId, zoneId ], 0 );

/**
 * Returns true if a zone is currently blocked by another user.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Number}  zoneId Zone ID
 * @return {Boolean}        Blocked status
 */
export const isBlocked = ( state, siteId, zoneId ) =>
	get( getLocksState( state ), [ 'blocked', siteId, zoneId ], false );

/**
 * Returns true if a zone lock has expired
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Number}  zoneId Zone ID
 * @return {Boolean}        Expired
 */
export const isExpired = ( state, siteId, zoneId ) => {
	const lock = getLock( state, siteId, zoneId );
	return !! lock && lock <= new Date().getTime();
};

/**
 * Returns true if a zone lock is being requested
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Number}  zoneId Zone ID
 * @return {Boolean}        Requesting
 */
export const isRequesting = ( state, siteId, zoneId ) =>
	get( getLocksState( state ), [ 'requesting', siteId, zoneId ], false );

/**
 * Returns the max zone lock period for a site
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @return {Number}        Maximum lock period in miliseconds
 */
export const getMaxLockPeriod = ( state, siteId ) =>
	get( getLocksState( state ), [ 'maxLockPeriod', siteId ], -1 );

/**
 * Returns the time when the lock was created
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @param  {Number} zoneId Zone ID
 * @return {Number}        Lock creation date
 */
export const getLockTimeCreated = ( state, siteId, zoneId ) =>
	get( getLocksState( state ), [ 'created', siteId, zoneId ], 0 );
