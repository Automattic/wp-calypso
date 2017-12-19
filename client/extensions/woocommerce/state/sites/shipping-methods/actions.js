/** @format */
/**
 * External dependencies
 */
import { startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import request from 'woocommerce/state/sites/request';
import { setError } from '../status/wc-api/actions';
import {
	WOOCOMMERCE_SHIPPING_METHODS_REQUEST,
	WOOCOMMERCE_SHIPPING_METHODS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import { areShippingMethodsLoaded, areShippingMethodsLoading } from './selectors';
import { isWcsEnabled } from 'woocommerce/state/selectors/plugins';
import { fetchShippingSchema } from 'woocommerce/woocommerce-services/state/shipping-schemas/actions';

export const fetchShippingMethodsSuccess = ( siteId, data ) => {
	return {
		type: WOOCOMMERCE_SHIPPING_METHODS_REQUEST_SUCCESS,
		siteId,
		data,
	};
};

export const fetchShippingMethods = siteId => ( dispatch, getState ) => {
	if (
		areShippingMethodsLoaded( getState(), siteId ) ||
		areShippingMethodsLoading( getState(), siteId )
	) {
		return;
	}

	const getAction = {
		type: WOOCOMMERCE_SHIPPING_METHODS_REQUEST,
		siteId,
	};

	dispatch( getAction );

	return request( siteId )
		.get( 'shipping_methods' )
		.then( data => {
			dispatch( fetchShippingMethodsSuccess( siteId, data ) );
			return data;
		} )
		.then( data => {
			const wcsMethods = isWcsEnabled( getState(), siteId )
				? data.filter( ( { id } ) => startsWith( id, 'wc_services' ) )
				: [];
			wcsMethods.forEach( ( { id } ) => dispatch( fetchShippingSchema( siteId, id ) ) );
		} )
		.catch( err => {
			dispatch( setError( siteId, getAction, err ) );
		} );
};
