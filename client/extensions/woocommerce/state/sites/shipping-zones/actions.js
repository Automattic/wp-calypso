/**
 * Internal dependencies
 */
import request from '../request';
import { setError } from '../status/wc-api/actions';
import {
	WOOCOMMERCE_SHIPPING_ZONES_REQUEST,
	WOOCOMMERCE_SHIPPING_ZONES_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import {
	areShippingZonesLoaded,
	areShippingZonesLoading,
} from './selectors';
import { fetchShippingZoneMethods } from '../shipping-zone-methods/actions';
import { fetchShippingZoneLocations } from '../shipping-zone-locations/actions';

export const fetchShippingZonesSuccess = ( siteId, data ) => {
	return {
		type: WOOCOMMERCE_SHIPPING_ZONES_REQUEST_SUCCESS,
		siteId,
		data,
	};
};

export const fetchShippingZones = ( siteId ) => ( dispatch, getState ) => {
	if ( areShippingZonesLoaded( getState(), siteId ) || areShippingZonesLoading( getState(), siteId ) ) {
		return;
	}

	const getAction = {
		type: WOOCOMMERCE_SHIPPING_ZONES_REQUEST,
		siteId,
	};

	dispatch( getAction );

	return request( siteId ).get( 'shipping/zones' )
		.catch( err => {
			dispatch( setError( siteId, getAction, err ) );
		} )
		.then( ( data ) => {
			if ( ! data ) {
				return;
			}
			dispatch( fetchShippingZonesSuccess( siteId, data ) );
			return Promise.all( data.map( zone => {
				return fetchShippingZoneMethods( siteId, zone.id )( dispatch, getState );
			} ).concat( data.map( zone => {
				return fetchShippingZoneLocations( siteId, zone.id )( dispatch, getState );
			} ) ) );
		} );
};
