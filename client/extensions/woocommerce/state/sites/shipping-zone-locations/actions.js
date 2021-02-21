/**
 * Internal dependencies
 */

import request from 'woocommerce/state/sites/request';
import { setError } from '../status/wc-api/actions';
import {
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_REQUEST,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_REQUEST_SUCCESS,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_UPDATE,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_UPDATED,
} from 'woocommerce/state/action-types';
import { areShippingZoneLocationsLoaded, areShippingZoneLocationsLoading } from './selectors';

export const fetchShippingZoneLocations = ( siteId, zoneId ) => ( dispatch, getState ) => {
	if (
		areShippingZoneLocationsLoaded( getState(), zoneId, siteId ) ||
		areShippingZoneLocationsLoading( getState(), zoneId, siteId )
	) {
		return;
	}

	//0 is Locations not covered by your other zones zone, skip fetching locations
	if ( 0 === zoneId ) {
		dispatch( {
			type: WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_REQUEST_SUCCESS,
			siteId,
			zoneId,
			data: [],
		} );
		return;
	}

	const getAction = {
		type: WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_REQUEST,
		siteId,
		zoneId,
	};

	dispatch( getAction );

	return request( siteId )
		.get( 'shipping/zones/' + zoneId + '/locations' )
		.then( ( data ) => {
			dispatch( {
				type: WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_REQUEST_SUCCESS,
				siteId,
				zoneId,
				data,
			} );
		} )
		.catch( ( err ) => {
			dispatch( setError( siteId, getAction, err ) );
		} );
};

export function updateShippingZoneLocations(
	siteId,
	zoneId,
	locations,
	successAction,
	failureAction
) {
	return {
		type: WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_UPDATE,
		siteId,
		zoneId,
		locations,
		successAction,
		failureAction,
	};
}

export function shippingZoneLocationsUpdated( siteId, data, originatingAction ) {
	return {
		type: WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_UPDATED,
		siteId,
		data,
		originatingAction,
	};
}
