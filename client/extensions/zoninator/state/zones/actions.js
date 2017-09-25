/**
 * Internal dependencies
 */
import { ZONINATOR_ADD_ZONE, ZONINATOR_DELETE_ZONE, ZONINATOR_REQUEST_ERROR, ZONINATOR_REQUEST_ZONES, ZONINATOR_SAVE_ZONE, ZONINATOR_UPDATE_ZONE, ZONINATOR_UPDATE_ZONES } from '../action-types';

/**
 * Returns an action object to indicate that a request has been made to fetch the zones.
 *
 * @param  {Number} siteId Site ID
 * @return {Action}        Action object
 */
export const requestZones = siteId => ( { type: ZONINATOR_REQUEST_ZONES, siteId } );

/**
 * Returns an action object to indicate that an error was received when fetching the zones.
 *
 * @param  {Number} siteId Site ID
 * @return {Action}        Action object
 */
export const requestError = siteId => ( { type: ZONINATOR_REQUEST_ERROR, siteId } );

/**
 * Returns an action object to indicate that all the zones should be updated.
 *
 * @param  {Number} siteId Site ID
 * @param  {Object} data   Zones
 * @return {Object}        Action object
 */
export const updateZones = ( siteId, data ) => ( { type: ZONINATOR_UPDATE_ZONES, siteId, data } );

/**
 * Returns an action object to indicate that a zone should be updated.
 *
 * @param  {Number} siteId Site ID
 * @param  {Number} zoneId Zone ID
 * @param  {Object} data   Zone details
 * @return {Object}        Action object
 */
export const updateZone = ( siteId, zoneId, data ) => ( { type: ZONINATOR_UPDATE_ZONE, siteId, zoneId, data } );

/**
 * Returns an action object to indicate that a new zone should be created.
 *
 * @param  {Number} siteId Site ID
 * @param  {String} form   Form name
 * @param  {Object} data   Zone details
 * @return {Object}        Action object
 */
export const addZone = ( siteId, form, data ) => ( { type: ZONINATOR_ADD_ZONE, siteId, form, data } );

/**
 * Returns an action object to indicate that a zone should be saved.
 *
 * @param  {Number} siteId Site ID
 * @param  {Number} zoneId Zone ID
 * @param  {String} form   Form name
 * @param  {Object} data   Zone details
 * @return {Object}        Action object
 */
export const saveZone = ( siteId, zoneId, form, data ) => ( {
	type: ZONINATOR_SAVE_ZONE,
	siteId,
	zoneId,
	form,
	data,
} );

/**
 * Returns an action object to indicate that a zone should be deleted.
 * @param  {Number} siteId Site ID
 * @param  {Number} zoneId Zone ID
 * @return {Object}        Action object
 */
export const deleteZone = ( siteId, zoneId ) => ( { type: ZONINATOR_DELETE_ZONE, siteId, zoneId } );
