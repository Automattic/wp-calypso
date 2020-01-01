/**
 * Internal dependencies
 */

import {
	ZONINATOR_ADD_ZONE,
	ZONINATOR_DELETE_ZONE,
	ZONINATOR_REQUEST_ERROR,
	ZONINATOR_REQUEST_ZONES,
	ZONINATOR_SAVE_ZONE,
	ZONINATOR_UPDATE_ZONE,
	ZONINATOR_UPDATE_ZONES,
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
 * @param  {object} data   Zones
 * @return {object}        Action object
 */
export const updateZones = ( siteId, data ) => ( { type: ZONINATOR_UPDATE_ZONES, siteId, data } );

/**
 * Returns an action object to indicate that a zone should be updated.
 *
 * @param  {Number} siteId Site ID
 * @param  {Number} zoneId Zone ID
 * @param  {object} data   Zone details
 * @return {object}        Action object
 */
export const updateZone = ( siteId, zoneId, data ) => ( {
	type: ZONINATOR_UPDATE_ZONE,
	siteId,
	zoneId,
	data,
} );

/**
 * Returns an action object to indicate that a new zone should be created.
 *
 * @param  {Number} siteId   Site ID
 * @param  {string} siteSlug Site slug
 * @param  {string} form     Form name
 * @param  {object} data     Zone details
 * @return {object}          Action object
 */
export const addZone = ( siteId, siteSlug, form, data ) => ( {
	type: ZONINATOR_ADD_ZONE,
	siteId,
	siteSlug,
	form,
	data,
} );

/**
 * Returns an action object to indicate that a zone should be saved.
 *
 * @param  {Number} siteId Site ID
 * @param  {Number} zoneId Zone ID
 * @param  {string} form   Form name
 * @param  {object} data   Zone details
 * @return {object}        Action object
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
 * @param  {Number} siteId   Site ID
 * @param  {string} siteSlug Site slug
 * @param  {Number} zoneId   Zone ID
 * @return {object}          Action object
 */
export const deleteZone = ( siteId, siteSlug, zoneId ) => ( {
	type: ZONINATOR_DELETE_ZONE,
	siteId,
	siteSlug,
	zoneId,
} );
