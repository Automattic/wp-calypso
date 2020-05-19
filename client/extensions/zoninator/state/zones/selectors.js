/**
 * External dependencies
 */

import { get, values } from 'lodash';

const getZonesState = ( state ) => state.extensions.zoninator.zones;

/**
 * Returns true if zones are being requested for the specified site ID.
 *
 * @param  {object} state  Global state tree
 * @param  {number} siteId Site ID
 * @returns {boolean}       Whether zones are being requested
 */
export const isRequestingZones = ( state, siteId ) =>
	get( getZonesState( state ), [ 'requesting', siteId ], false );

/**
 * Returns the zones for the specified site ID.
 *
 * @param  {object} state  Global state tree
 * @param  {number} siteId Site ID
 * @returns {Array}         Zones
 */
export const getZones = ( state, siteId ) =>
	values( get( getZonesState( state ), [ 'items', siteId ], {} ) );

/**
 * Returns a specific zone.
 *
 * @param  {object} state  Global state tree
 * @param  {number} siteId Site ID
 * @param  {number} zoneId Zone ID
 * @returns {object}        Zone
 */
export const getZone = ( state, siteId, zoneId ) =>
	get( getZonesState( state ), [ 'items', siteId, zoneId ], null );
