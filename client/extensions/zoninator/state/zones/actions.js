/**
 * Internal dependencies
 */
import {
	ZONINATOR_REQUEST_ZONES,
	ZONINATOR_REQUEST_ERROR,
	ZONINATOR_UPDATE_ZONES,
} from '../action-types';

export const requestZones = siteId => ( { type: ZONINATOR_REQUEST_ZONES, siteId } );

export const requestError = siteId => ( { type: ZONINATOR_REQUEST_ERROR, siteId } );

export const updateZones = ( siteId, data ) => ( { type: ZONINATOR_UPDATE_ZONES, siteId, data } );
