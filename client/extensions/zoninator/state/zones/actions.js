/**
 * Internal dependencies
 */
import {
	ZONINATOR_REQUEST_ZONES,
	ZONINATOR_REQUEST_ERROR,
	ZONINATOR_UPDATE_ZONES,
	ZONINATOR_ADD_ZONE,
	ZONINATOR_UPDATE_ZONE,
} from '../action-types';

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
 * @param  {Object} data   Zone details
 * @return {Object}        Action object
 */
export const updateZone = ( siteId, data ) => ( { type: ZONINATOR_UPDATE_ZONE, siteId, data } );

/**
 * Returns an action object to indicate that a new zone should be created.
 *
 * @param  {Number} siteId Site ID
 * @param  {String} form   Form name
 * @param  {Object} data   Zone details
 * @return {Object}        Action object
 */
export const addZone = ( siteId, form, data ) => ( { type: ZONINATOR_ADD_ZONE, siteId, form, data } );
