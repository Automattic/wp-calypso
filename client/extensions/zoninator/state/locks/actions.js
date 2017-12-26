/** @format */

/**
 * Internal dependencies
 */

import { ZONINATOR_REQUEST_LOCK, ZONINATOR_UPDATE_LOCK } from '../action-types';

/**
 * Returns an action object to indicate that a zone lock should be updated.
 *
 * @param  {Number}  siteId         Site ID
 * @param  {Number}  zoneId         Zone ID
 * @param  {Boolean} currentSession True is the lock belongs to the current session
 * @param  {Date}    created        The date & time of when the lock was created
 * @return {Action}                 Action object
 */
export const updateLock = ( siteId, zoneId, currentSession, created = new Date() ) => ( {
	type: ZONINATOR_UPDATE_LOCK,
	siteId,
	zoneId,
	currentSession,
	created,
} );

/**
 * Returns an action object to indicate that a zone lock should be requested
 *
 * @param  {Number}  siteId  Site ID
 * @param  {Number}  zoneId  Zone ID
 * @param  {Boolean} refresh Set to true to just refresh the lock on the server
 * @return {Action}          Action
 */
export const requestLock = ( siteId, zoneId, refresh ) => ( {
	type: ZONINATOR_REQUEST_LOCK,
	siteId,
	zoneId,
	refresh,
} );
