/**
 * External dependencies
 */
import { get } from 'lodash';

const getZonesState = ( state ) => state.extensions.zoninator.zones;

export const isRequestingZones = ( state, siteId ) =>
	get( getZonesState( state ), [ 'requesting', siteId ], false );

export const getZones = ( state, siteId ) =>
	get( getZonesState( state ), [ 'items', siteId ], [] );
