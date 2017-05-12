/**
 * External dependencies
 */
import { isArray, omit } from 'lodash';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SHIPPING_METHODS_FETCH_ERROR,
	WOOCOMMERCE_SHIPPING_METHODS_FETCH_SUCCESS,
	WOOCOMMERCE_SHIPPING_ZONE_ADD_ERROR,
	WOOCOMMERCE_SHIPPING_ZONE_ADD_SUCCESS,
	WOOCOMMERCE_SHIPPING_ZONE_DELETE_ERROR,
	WOOCOMMERCE_SHIPPING_ZONE_DELETE_SUCCESS,
	WOOCOMMERCE_SHIPPING_ZONE_UPDATE_ERROR,
	WOOCOMMERCE_SHIPPING_ZONE_UPDATE_SUCCESS,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_FETCH_ERROR,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_FETCH_SUCCESS,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_UPDATE_ERROR,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_UPDATE_SUCCESS,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD_ERROR,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD_SUCCESS,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_DELETE_ERROR,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_DELETE_SUCCESS,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_UPDATE_ERROR,
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_UPDATE_SUCCESS,
	WOOCOMMERCE_SHIPPING_ZONE_METHODS_FETCH_ERROR,
	WOOCOMMERCE_SHIPPING_ZONE_METHODS_FETCH_SUCCESS,
	WOOCOMMERCE_SHIPPING_ZONES_FETCH_ERROR,
	WOOCOMMERCE_SHIPPING_ZONES_FETCH_SUCCESS,
} from '../../../action-types';
import * as api from '../../../helpers/api';

const removeLinks = ( data ) => isArray( data ) ? data.map( removeLinks ) : omit( data, '_links' );

export const ACTION_NAMES = {
	FETCH_ZONES: 'FETCH_ZONES',
	FETCH_METHODS: 'FETCH_METHODS',
	FETCH_ZONE_METHODS: 'FETCH_ZONE_METHODS',
	FETCH_ZONE_LOCATIONS: 'FETCH_ZONE_LOCATIONS',
	ADD_METHOD: 'ADD_METHOD',
	UPDATE_METHOD: 'UPDATE_METHOD',
	DELETE_METHOD: 'DELETE_METHOD',
	UPDATE_LOCATIONS: 'UPDATE_LOCATIONS',
	ADD_ZONE: 'ADD_ZONE',
	UPDATE_ZONE: 'UPDATE_ZONE',
	DELETE_ZONE: 'DELETE_ZONE',
};

export default ( action, dispatch, state, { payload, id, zoneId } = {} ) => {
	switch ( action ) {
		case ACTION_NAMES.FETCH_ZONES:
			return api.get( 'shipping/zones', state )
				.then( ( zones ) => {
					dispatch( {
						type: WOOCOMMERCE_SHIPPING_ZONES_FETCH_SUCCESS,
						zones: removeLinks( zones ),
					} );
					return zones.map( ( zone ) => zone.id );
				} )
				.catch( ( error ) => {
					dispatch( {
						type: WOOCOMMERCE_SHIPPING_ZONES_FETCH_ERROR,
						error,
					} );
					throw error;
				} );

		case ACTION_NAMES.FETCH_METHODS:
			return api.get( 'shipping_methods', state )
				.then( ( methods ) => dispatch( {
					type: WOOCOMMERCE_SHIPPING_METHODS_FETCH_SUCCESS,
					methods: removeLinks( methods ),
				} ) )
				.catch( ( error ) => {
					dispatch( {
						type: WOOCOMMERCE_SHIPPING_METHODS_FETCH_ERROR,
						error,
					} );
					throw error;
				} );

		case ACTION_NAMES.FETCH_ZONE_METHODS:
			return api.get( `shipping/zones/${ zoneId }/methods`, state )
				.then( ( methods ) => dispatch( {
					type: WOOCOMMERCE_SHIPPING_ZONE_METHODS_FETCH_SUCCESS,
					id: zoneId,
					methods: removeLinks( methods ),
				} ) )
				.catch( ( error ) => {
					dispatch( {
						type: WOOCOMMERCE_SHIPPING_ZONE_METHODS_FETCH_ERROR,
						id: zoneId,
						error,
					} );
					throw error;
				} );

		case ACTION_NAMES.FETCH_ZONE_LOCATIONS:
			return api.get( `shipping/zones/${ zoneId }/locations`, state )
				.then( ( locations ) => dispatch( {
					type: WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_FETCH_SUCCESS,
					id: zoneId,
					locations: removeLinks( locations ),
				} ) )
				.catch( ( error ) => {
					dispatch( {
						type: WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_FETCH_ERROR,
						id: zoneId,
						error,
					} );
					throw error;
				} );

		case ACTION_NAMES.ADD_METHOD:
			return api.post( `shipping/zones/${ zoneId }/methods`, omit( payload, 'order' ), state )
				.then( ( method ) => {
					dispatch( {
						type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD_SUCCESS,
						zoneId,
						method: removeLinks( method ),
						order: payload.order,
					} );
					return method.instance_id;
				} )
				.catch( ( error ) => {
					dispatch( {
						type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_ADD_ERROR,
						zoneId,
						error,
						order: payload.order,
					} );
					throw error;
				} );

		case ACTION_NAMES.UPDATE_METHOD:
			return api.put( `shipping/zones/${ zoneId }/methods/${ id }`, payload, state )
				.then( ( method ) => {
					dispatch( {
						type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_UPDATE_SUCCESS,
						zoneId,
						method: removeLinks( method ),
					} );
					return method.instance_id;
				} )
				.catch( ( error ) => {
					dispatch( {
						type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_UPDATE_ERROR,
						zoneId,
						error,
						id,
					} );
					throw error;
				} );

		case ACTION_NAMES.DELETE_METHOD:
			return api.del( `shipping/zones/${ zoneId }/methods/${ id }`, state )
				.then( ( method ) => {
					dispatch( {
						type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_DELETE_SUCCESS,
						zoneId,
						method: removeLinks( method ),
					} );
					return method.instance_id;
				} )
				.catch( ( error ) => {
					dispatch( {
						type: WOOCOMMERCE_SHIPPING_ZONE_METHOD_DELETE_ERROR,
						zoneId,
						error,
						id,
					} );
					throw error;
				} );

		case ACTION_NAMES.UPDATE_LOCATIONS:
			return api.put( `shipping/zones/${ zoneId }/locations`, payload, state )
				.then( ( locations ) => {
					dispatch( {
						type: WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_UPDATE_SUCCESS,
						zoneId,
						locations: removeLinks( locations ),
					} );
					return null; // The "locations array" doesn't have any unique ID
				} )
				.catch( ( error ) => {
					dispatch( {
						type: WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_UPDATE_ERROR,
						zoneId,
						error,
					} );
					throw error;
				} );

		case ACTION_NAMES.ADD_ZONE:
			return api.post( 'shipping/zones', payload, state )
				.then( ( zone ) => {
					dispatch( {
						type: WOOCOMMERCE_SHIPPING_ZONE_ADD_SUCCESS,
						zone: removeLinks( zone ),
					} );
					return zone.id;
				} )
				.catch( ( error ) => {
					dispatch( {
						type: WOOCOMMERCE_SHIPPING_ZONE_ADD_ERROR,
						error,
						order: payload.order,
					} );
					throw error;
				} );

		case ACTION_NAMES.UPDATE_ZONE:
			return api.put( `shipping/zones/${ zoneId }`, payload, state )
				.then( ( zone ) => {
					dispatch( {
						type: WOOCOMMERCE_SHIPPING_ZONE_UPDATE_SUCCESS,
						zone: removeLinks( zone ),
					} );
					return zone.id;
				} )
				.catch( ( error ) => {
					dispatch( {
						type: WOOCOMMERCE_SHIPPING_ZONE_UPDATE_ERROR,
						error,
						zoneId,
					} );
					throw error;
				} );

		case ACTION_NAMES.DELETE_ZONE:
			return api.del( `shipping/zones/${ zoneId }`, state )
				.then( ( zone ) => {
					dispatch( {
						type: WOOCOMMERCE_SHIPPING_ZONE_DELETE_SUCCESS,
						zone: removeLinks( zone ),
					} );
					return zone.id;
				} )
				.catch( ( error ) => {
					dispatch( {
						type: WOOCOMMERCE_SHIPPING_ZONE_DELETE_ERROR,
						error,
						zoneId,
					} );
					throw error;
				} );

		default:
			throw new Error( 'Unrecognized action "' + action + '"' );
	}
};
