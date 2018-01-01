/** @format */

/**
 * Internal dependencies
 */
import {
	ZONINATOR_REQUEST_LOCK,
	ZONINATOR_REQUEST_LOCK_ERROR,
	ZONINATOR_UPDATE_LOCK,
} from '../action-types';

/**
 * Returns an action object to indicate that a zone lock should be updated
 *
 * @param  {Number}  siteId          Site ID
 * @param  {Number}  zoneId          Zone ID
 * @param  {Date}    expires         Expiration date
 * @param  {Number}  maxLockPeriod   Maximum number of seconds to extend the lock to
 * @param  {Boolean} reset           Set to true to reset a lock
 * @return {Action}                  Action object
 */
export const updateLock = ( siteId, zoneId, expires, maxLockPeriod, reset ) => ( {
	type: ZONINATOR_UPDATE_LOCK,
	siteId,
	zoneId,
	expires,
	maxLockPeriod,
	reset,
} );

/**
 * Returns an action object to indicate that a zone lock should be requested
 *
 * @param  {Number}  siteId  Site ID
 * @param  {Number}  zoneId  Zone ID
 * @param  {Boolean} reset   Set to true to reset a lock
 * @return {Action}          Action
 */
export const requestLock = ( siteId, zoneId, reset ) => ( {
	type: ZONINATOR_REQUEST_LOCK,
	siteId,
	zoneId,
	reset,
} );

/**
 * Returns an action object to indicate that a zone failed to lock
 *
 * @param  {Number}  siteId  Site ID
 * @param  {Number}  zoneId  Zone ID
 * @param  {Boolean} blocked Set to true if the zone is blocked by another user
 * @return {Action}          Action object
 */
export const requestLockError = ( siteId, zoneId, blocked ) => ( {
	type: ZONINATOR_REQUEST_LOCK_ERROR,
	siteId,
	zoneId,
	blocked,
} );
