/** @format */

/**
 * Internal dependencies
 */
import {
	ZONINATOR_REQUEST_LOCK,
	ZONINATOR_REQUEST_LOCK_ERROR,
	ZONINATOR_RESET_LOCK,
	ZONINATOR_UPDATE_LOCK,
} from '../action-types';

/**
 * Returns an action object to indicate that a zone lock should be updated
 *
 * @param  {Number}  siteId          Site ID
 * @param  {Number}  zoneId          Zone ID
 * @param  {Number}  expires         Expiration time in milliseconds
 * @param  {Number}  maxLockPeriod   Maximum number of milliseconds to extend the lock to
 * @return {Object}                  Action object
 */
export const updateLock = ( siteId, zoneId, expires, maxLockPeriod ) => ( {
	type: ZONINATOR_UPDATE_LOCK,
	siteId,
	zoneId,
	expires,
	maxLockPeriod,
} );

/**
 * Returns an action object to indicate that a zone lock should be requested
 *
 * @param  {Number}  siteId    Site ID
 * @param  {Number}  zoneId    Zone ID
 * @return {Object}            Action object
 */
export const requestLock = ( siteId, zoneId ) => ( {
	type: ZONINATOR_REQUEST_LOCK,
	siteId,
	zoneId,
} );

/**
 * Returns an action object to indicate that a zone failed to lock
 *
 * @param  {Number}  siteId  Site ID
 * @param  {Number}  zoneId  Zone ID
 * @return {Object}          Action object
 */
export const requestLockError = ( siteId, zoneId ) => ( {
	type: ZONINATOR_REQUEST_LOCK_ERROR,
	siteId,
	zoneId,
} );

/**
 * Returns an action object to indicate that a zone lock should be reset
 *
 * @param  {Number} siteId Site ID
 * @param  {Number} zoneId Zone ID
 * @return {Object}        Action object
 */
export const resetLock = ( siteId, zoneId ) => ( {
	type: ZONINATOR_RESET_LOCK,
	time: new Date().getTime(),
	siteId,
	zoneId,
} );
