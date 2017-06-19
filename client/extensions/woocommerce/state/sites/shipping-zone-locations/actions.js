/**
 * Internal dependencies
 */
import request from '../request';
import { setError } from '../status/wc-api/actions';
import {
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_REQUEST,
	WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import {
	areShippingZoneLocationsLoaded,
	areShippingZoneLocationsLoading,
} from './selectors';

export const fetchShippingZoneLocations = ( siteId, zoneId ) => ( dispatch, getState ) => {
	if ( areShippingZoneLocationsLoaded( getState(), zoneId, siteId ) ||
		areShippingZoneLocationsLoading( getState(), zoneId, siteId ) ) {
		return;
	}

	//0 is Rest of the World zone, skip fetching locations
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

	return request( siteId ).get( 'shipping/zones/' + zoneId + '/locations' )
		.then( ( data ) => {
			dispatch( {
				type: WOOCOMMERCE_SHIPPING_ZONE_LOCATIONS_REQUEST_SUCCESS,
				siteId,
				zoneId,
				data,
			} );
		} )
		.catch( err => {
			dispatch( setError( siteId, getAction, err ) );
		} );
};
