/** @format */

/**
 * Internal dependencies
 */

import * as api from '../../api';
import { setError } from 'woocommerce/state/sites/status/wc-api/actions';
import {
	WOOCOMMERCE_SERVICES_SHIPPING_SCHEMA_REQUEST,
	WOOCOMMERCE_SERVICES_SHIPPING_SCHEMA_REQUEST_SUCCESS,
} from 'woocommerce/woocommerce-services/state/action-types';
import { isShippingSchemaLoaded, isShippingSchemaLoading } from './selectors';

export const fetchShippingSchemaSuccess = ( siteId, methodId, data ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_SCHEMA_REQUEST_SUCCESS,
		siteId,
		methodId,
		data,
	};
};

export const fetchShippingSchema = ( siteId, methodId ) => ( dispatch, getState ) => {
	if (
		isShippingSchemaLoaded( getState(), methodId, siteId ) ||
		isShippingSchemaLoading( getState(), methodId, siteId )
	) {
		return;
	}

	const getAction = {
		type: WOOCOMMERCE_SERVICES_SHIPPING_SCHEMA_REQUEST,
		methodId,
		siteId,
	};

	dispatch( getAction );

	return api
		.get( siteId, api.url.serviceSettings( methodId ) )
		.then( data => dispatch( fetchShippingSchemaSuccess( siteId, methodId, data ) ) )
		.catch( err => dispatch( setError( siteId, getAction, err ) ) );
};
