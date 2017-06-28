/**
 * Internal dependencies
 */
import request from '../request';
import { setError } from '../status/wc-api/actions';
import {
	WOOCOMMERCE_SHIPPING_ZONE_METHODS_REQUEST,
	WOOCOMMERCE_SHIPPING_ZONE_METHODS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import {
	areShippingZoneMethodsLoaded,
	areShippingZoneMethodsLoading,
} from './selectors';

export const fetchShippingZoneMethodsSuccess = ( siteId, zoneId, data ) => {
	return {
		type: WOOCOMMERCE_SHIPPING_ZONE_METHODS_REQUEST_SUCCESS,
		siteId,
		zoneId,
		data,
	};
};

export const fetchShippingZoneMethods = ( siteId, zoneId ) => ( dispatch, getState ) => {
	if ( areShippingZoneMethodsLoaded( getState(), zoneId, siteId ) ||
		areShippingZoneMethodsLoading( getState(), zoneId, siteId ) ) {
		return;
	}

	const getAction = {
		type: WOOCOMMERCE_SHIPPING_ZONE_METHODS_REQUEST,
		siteId,
		zoneId,
	};

	dispatch( getAction );

	return request( siteId ).get( 'shipping/zones/' + zoneId + '/methods' )
		.then( ( data ) => {
			dispatch( fetchShippingZoneMethodsSuccess( siteId, zoneId, data ) );
		} )
		.catch( err => {
			dispatch( setError( siteId, getAction, err ) );
		} );
};
