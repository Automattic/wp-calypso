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
import { fetchShippingMethodSchema } from 'woocommerce/woocommerce-services/state/shipping-method-schemas/actions';
import config from 'config';

export const fetchShippingMethodsSuccess = ( siteId, data ) => {
	return {
		type: WOOCOMMERCE_SHIPPING_METHODS_REQUEST_SUCCESS,
		siteId,
		data,
	};
};

export const fetchShippingMethods = ( siteId ) => ( dispatch, getState ) => {
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
		.then( ( data ) => {
			dispatch( fetchShippingMethodsSuccess( siteId, data ) );
			return data;
		} )
		.then( ( data ) => {
			// Only need to check the feature flag. If WCS isn't enabled, no "wc_services_*" methods will be returned in the first place
			const wcsMethods = config.isEnabled( 'woocommerce/extension-wcservices' )
				? data.filter( ( { id } ) => startsWith( id, 'wc_services' ) )
				: [];
			wcsMethods.forEach( ( { id } ) => dispatch( fetchShippingMethodSchema( siteId, id ) ) );
		} )
		.catch( ( err ) => {
			dispatch( setError( siteId, getAction, err ) );
		} );
};
