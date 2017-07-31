/**
 * External dependencies
 */
import { get } from 'lodash';

const getZonesState = ( state ) => state.extensions.zoninator.zones;

export const isFetchingZones = ( state, siteId ) =>
	get( getZonesState( state ), [ 'fetching', siteId ], false );

export const getZones = ( state, siteId ) =>
	get( getZonesState( state ), [ 'items', siteId ], [] );
