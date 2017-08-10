/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

const getZonesState = state => state.extensions.zoninator.zones;

/**
 * Returns true if zones are being requested for the specified site ID.
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @return {Boolean}       Whether zones are being requested
 */
export const isRequestingZones = ( state, siteId ) =>
	get( getZonesState( state ), [ 'requesting', siteId ], false );

/**
 * Returns the zones for the specified site ID.
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @return {Array}         Zones
 */
export const getZones = ( state, siteId ) => get( getZonesState( state ), [ 'items', siteId ], [] );
