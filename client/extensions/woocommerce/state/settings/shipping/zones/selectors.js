/**
 * External dependencies
 */
import { get, remove, keyBy, omit, flatten, isEqual, xorBy, pick } from 'lodash';

/**
 * Internal dependencies
 */
import { ACTION_NAMES } from './request';

const getOperationsToUpdateMethod = ( method, serverMethod, zoneId ) => ( instanceId ) => {
	if ( ! method || method.markedToDelete ) {
		return [ {
			action: ACTION_NAMES.DELETE_METHOD,
			zoneId,
			id: instanceId,
		} ];
	}

	if ( ! isEqual( method, serverMethod ) ) {
		return [ {
			action: ACTION_NAMES.UPDATE_METHOD,
			zoneId,
			id: instanceId,
			payload: {
				...pick( method, [ 'enabled', 'order' ] ),
				settings: omit( method, [ 'id', 'error', 'enabled', 'order', 'method_id' ] ),
			},
		} ];
	}
};

const getOperationsToAddMethod = ( method, zoneId ) => {
	return [ {
		action: ACTION_NAMES.ADD_METHOD,
		zoneId,
		payload: pick( method, [ 'method_id', 'order' ] ),
		subOperations: [
			getOperationsToUpdateMethod( method, null, zoneId ),
		],
	} ];
};

const getOperationsToUpdateMethods = ( methods, serverMethods ) => ( zoneId ) => {
	methods = [ ...methods ];
	const newMethods = remove( methods, { id: null } );
	methods = keyBy( methods, 'id' );

	return [
		...flatten( newMethods.map( ( method ) => getOperationsToAddMethod( method, zoneId ) ) ),
		...flatten( serverMethods.map( ( serverMethod ) =>
			getOperationsToUpdateMethod( methods[ serverMethod.id ], serverMethod, zoneId )( serverMethod.id ) )
		),
	];
};

const getOperationsToUpdateLocations = ( locations, serverLocations ) => ( zoneId ) => {
	if ( ! xorBy( locations, serverLocations, isEqual ).length ) {
		return [];
	}
	return [ {
		action: ACTION_NAMES.UPDATE_LOCATIONS,
		payload: locations,
		zoneId,
	} ];
};

const getOperationsToUpdateZone = ( zone, serverZone ) => {
	if ( ! zone || zone.markedToDelete ) {
		return [ {
			action: ACTION_NAMES.DELETE_ZONE,
			zoneId: serverZone.id,
		} ];
	}

	if ( ! serverZone ) {
		return [ {
			action: ACTION_NAMES.ADD_ZONE,
			payload: omit( zone, [ 'id', 'error', 'locationsError', 'locations', 'methods' ] ),
			subOperations: [
				getOperationsToUpdateMethods( zone.methods, null ),
				getOperationsToUpdateLocations( zone.locations, null ),
			],
		} ];
	}

	const operations = [];
	const zoneInfo = omit( zone, [ 'error', 'locationsError', 'locations', 'methods' ] );
	const serverZoneInfo = omit( serverZone, [ 'locations', 'methods' ] );
	if ( ! isEqual( zoneInfo, serverZoneInfo ) ) {
		operations.push( {
			action: ACTION_NAMES.UPDATE_ZONE,
			zoneId: zone.id,
			payload: zoneInfo,
		} );
	}

	return [ ...operations,
		...getOperationsToUpdateMethods( zone.methods, serverZone.methods )( zone.id ),
		...getOperationsToUpdateLocations( zone.locations, serverZone.locations )( zone.id ),
	];
};

// TODO: memoize this selector
export const getOperationsToSaveZonesSettings = ( state ) => {
	const data = get( state, [ 'extensions', 'woocommerce', 'settings', 'shipping', 'zones' ] );
	let zones = [ ...data.zones ];
	const serverZones = [ ...data.serverZones ];
	const restOfWorldServerZone = remove( serverZones, { id: 0 } )[ 0 ];
	const restOfWorldZone = remove( zones, { id: 0 } )[ 0 ];
	if ( ! restOfWorldServerZone ) {
		throw new Error( 'The server didn\'t provide a "Rest Of The World" shipping zone' );
	}
	if ( ! restOfWorldZone ) {
		throw new Error( 'The "Rest Of The World" shipping zone has been deleted' );
	}
	const newZones = remove( zones, { id: null } );
	zones = keyBy( zones, 'id' );

	return [
		...flatten( newZones.map( ( zone ) => getOperationsToUpdateZone( zone, null ) ) ),
		...flatten( serverZones.map( ( serverZone ) => getOperationsToUpdateZone( zones[ serverZone.id ], serverZone ) ) ),
		// "Rest of the world" zone can't have custom name or locations, so only look at their differences in methods
		...getOperationsToUpdateMethods( restOfWorldZone.methods, restOfWorldServerZone.methods )( 0 ),
	];
};
