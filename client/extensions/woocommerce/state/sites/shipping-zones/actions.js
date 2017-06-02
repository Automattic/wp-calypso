/**
 * Internal dependencies
 */
import request from '../request';
import { setError } from '../../site/status/wc-api/actions';
import {
	WOOCOMMERCE_API_FETCH_SHIPPING_ZONES,
	WOOCOMMERCE_API_FETCH_SHIPPING_ZONES_SUCCESS,
} from 'woocommerce/state/action-types';
import {
	areShippingZonesLoaded,
	areShippingZonesLoading,
} from './selectors';

export const fetchShippingZonesSuccess = ( siteId, data ) => {
	return {
		type: WOOCOMMERCE_API_FETCH_SHIPPING_ZONES_SUCCESS,
		payload: {
			siteId,
			data,
		},
	};
};

export const fetchShippingZones = ( siteId ) => ( dispatch, getState ) => {
	if ( areShippingZonesLoaded( getState(), siteId ) || areShippingZonesLoading( getState(), siteId ) ) {
		return;
	}

	const getAction = {
		type: WOOCOMMERCE_API_FETCH_SHIPPING_ZONES,
		payload: { siteId },
	};

	dispatch( getAction );

	return request( siteId ).get( 'shipping/zones' )
		.then( ( data ) => {
			dispatch( fetchShippingZonesSuccess( siteId, data ) );
		} )
		.catch( err => {
			dispatch( setError( siteId, getAction, err ) );
		} );
};
