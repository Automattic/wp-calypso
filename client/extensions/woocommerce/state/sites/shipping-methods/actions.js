/**
 * Internal dependencies
 */
import request from '../request';
import { setError } from '../status/wc-api/actions';
import { areShippingMethodsLoaded, areShippingMethodsLoading } from './selectors';
import { WOOCOMMERCE_SHIPPING_METHODS_REQUEST, WOOCOMMERCE_SHIPPING_METHODS_REQUEST_SUCCESS } from 'woocommerce/state/action-types';

export const fetchShippingMethodsSuccess = ( siteId, data ) => {
	return {
		type: WOOCOMMERCE_SHIPPING_METHODS_REQUEST_SUCCESS,
		siteId,
		data,
	};
};

export const fetchShippingMethods = ( siteId ) => ( dispatch, getState ) => {
	if ( areShippingMethodsLoaded( getState(), siteId ) || areShippingMethodsLoading( getState(), siteId ) ) {
		return;
	}

	const getAction = {
		type: WOOCOMMERCE_SHIPPING_METHODS_REQUEST,
		siteId,
	};

	dispatch( getAction );

	return request( siteId ).get( 'shipping_methods' )
		.then( ( data ) => {
			dispatch( fetchShippingMethodsSuccess( siteId, data ) );
		} )
		.catch( err => {
			dispatch( setError( siteId, getAction, err ) );
		} );
};
