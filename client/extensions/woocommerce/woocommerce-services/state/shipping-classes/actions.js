/** @format */

/**
 * Internal dependencies
 */

import * as api from '../../api';
import { setError } from 'woocommerce/state/sites/status/wc-api/actions';
import {
	WOOCOMMERCE_SERVICES_SHIPPING_CLASSES_REQUEST,
	WOOCOMMERCE_SERVICES_SHIPPING_CLASSES_REQUEST_SUCCESS,
} from 'woocommerce/woocommerce-services/state/action-types';
import { areShippingClassesLoaded, areShippingClassesLoading } from './selectors';

export const fetchShippingClassesSuccess = ( siteId, data ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_CLASSES_REQUEST_SUCCESS,
		siteId,
		data,
	};
};

export const fetchShippingClasses = siteId => ( dispatch, getState ) => {
	if (
		areShippingClassesLoaded( getState(), siteId ) ||
		areShippingClassesLoading( getState(), siteId )
	) {
		return;
	}

	const getAction = {
		type: WOOCOMMERCE_SERVICES_SHIPPING_CLASSES_REQUEST,
		siteId,
	};

	dispatch( getAction );

	return api
		.get( siteId, api.url.shippingClasses() )
		.then( data => dispatch( fetchShippingClassesSuccess( siteId, data ) ) )
		.catch( err => dispatch( setError( siteId, getAction, err ) ) );
};
