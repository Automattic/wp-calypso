/**
 * Internal dependencies
 */
import {
	ZONINATOR_FETCH_ZONES,
	ZONINATOR_FETCH_ERROR,
	ZONINATOR_UPDATE_ZONES,
} from '../action-types';

export const fetchZones = siteId => ( { type: ZONINATOR_FETCH_ZONES, siteId } );

export const fetchError = siteId => ( { type: ZONINATOR_FETCH_ERROR, siteId } );

export const updateZones = ( siteId, data ) => ( { type: ZONINATOR_UPDATE_ZONES, siteId, data } );
