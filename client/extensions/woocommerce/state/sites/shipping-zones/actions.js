/**
 * Internal dependencies
 */
import request from '../request';
import { setError } from '../status/wc-api/actions';
import {
	WOOCOMMERCE_API_FETCH_SHIPPING_ZONES,
	WOOCOMMERCE_API_FETCH_SHIPPING_ZONES_SUCCESS,
} from 'woocommerce/state/action-types';
import {
	areShippingZonesLoaded,
	areShippingZonesLoading,
} from './selectors';

export const fetchShippingZones = ( siteId ) => ( dispatch, getState ) => {
	if ( areShippingZonesLoaded( getState(), siteId ) || areShippingZonesLoading( getState(), siteId ) ) {
		return;
	}

	const getAction = {
		type: WOOCOMMERCE_API_FETCH_SHIPPING_ZONES,
		siteId,
	};

	dispatch( getAction );

	return request( siteId ).get( 'shipping/zones' )
		.then( ( data ) => {
			dispatch( {
				type: WOOCOMMERCE_API_FETCH_SHIPPING_ZONES_SUCCESS,
				siteId,
				data,
			} );
		} )
		.catch( err => {
			dispatch( setError( siteId, getAction, err ) );
		} );
};
