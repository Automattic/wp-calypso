/**
<<<<<<< Updated upstream
=======
 * External dependencies
 */
import { flattenDeep, filter, isArray } from 'lodash';

/**
>>>>>>> Stashed changes
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SHIPPING_ZONE_ADD,
	WOOCOMMERCE_SHIPPING_ZONE_CANCEL,
	WOOCOMMERCE_SHIPPING_ZONE_CLOSE,
	WOOCOMMERCE_SHIPPING_ZONE_EDIT,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATION_ADD,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATION_REMOVE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_CHANGE_TYPE,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_EDIT,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_REMOVE,
	WOOCOMMERCE_SHIPPING_ZONE_REMOVE,
} from '../../../action-types';
import request, { ACTION_NAMES } from './request';
import { getOperationsToSaveZonesSettings } from './selectors';

export const fetchServerData = () => ( dispatch, getState ) => {
	// TODO: Prevent duplicate requests on subsequent fetchServerData calls
	const state = getState();
	request( ACTION_NAMES.FETCH_METHODS, dispatch, state );
	request( ACTION_NAMES.FETCH_ZONES, dispatch, state )
		.then( ( zoneIds ) => {
			zoneIds.forEach( ( zoneId ) => {
				if ( zoneId ) { // No need to fetch locations from "Rest of the world" zone (id=0)
					request( ACTION_NAMES.FETCH_ZONE_LOCATIONS, dispatch, state, { zoneId } );
				}
				request( ACTION_NAMES.FETCH_ZONE_METHODS, dispatch, state, { zoneId } );
			} );
		} );
};

const runOperations = ( operations, dispatch, state ) =>
	Promise.all(
		operations.map( ( { action, payload, id, zoneId, subOperations } ) =>
			request( action, dispatch, state, { payload, id, zoneId } )
				.then( ( resultId ) =>
					subOperations && Promise.all( subOperations.map( ( subOperationFunc ) =>
						runOperations( subOperationFunc( resultId ), dispatch, state )
					) ) )
				.catch( ( error ) => isArray( error ) ? error : { error } ) // Prevent the promise list aborting early
			)
		);

export const submitChanges = () => ( dispatch, getState ) => {
	// TODO: Put individual errors in the state so they can be displayed in the UI
	// TODO: Update the serverZones state tree with each success response so it always reflect the server state
	const state = getState();
	runOperations( getOperationsToSaveZonesSettings( state ), dispatch, state )
		.then( ( results ) => {
			const success = ! filter( flattenDeep( results ), 'error' ).length;
			alert( 'Success: ' + success );
			// TODO: Show some kind of success notice
			// TODO: This only saves the zone settings, not the entire page
		} );
};

export const addShippingZone = () => ( { type: WOOCOMMERCE_SHIPPING_ZONE_ADD } );

export const editShippingZone = ( index ) => ( { type: WOOCOMMERCE_SHIPPING_ZONE_EDIT, index } );

export const cancelEditingShippingZone = () => ( { type: WOOCOMMERCE_SHIPPING_ZONE_CANCEL } );

// TODO: Trigger some client-side validation here
export const closeEditingShippingZone = () => ( { type: WOOCOMMERCE_SHIPPING_ZONE_CLOSE } );

export const removeShippingZone = ( index ) => ( { type: WOOCOMMERCE_SHIPPING_ZONE_REMOVE, index } );

export const addLocationToShippingZone = ( locationType, locationCode ) => ( {
	type: WOOCOMMERCE_SHIPPING_ZONE_LOCATION_ADD,
	locationType,
	locationCode
} );

export const removeLocationFromShippingZone = ( locationType, locationCode ) => ( {
	type: WOOCOMMERCE_SHIPPING_ZONE_LOCATION_REMOVE,
	locationType,
	locationCode
} );

export const addShippingMethod = () => ( { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD } );

export const changeShippingMethodType = ( index, newType ) => ( { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_CHANGE_TYPE, index, newType } );

export const editShippingMethod = ( index, field, value ) => ( { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_EDIT, index, field, value } );

export const removeShippingMethod = ( index ) => ( { type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_REMOVE, index } );
