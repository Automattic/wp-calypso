/**
 * Internal dependencies
 */

import * as api from '../../api';
import { setError } from 'woocommerce/state/sites/status/wc-api/actions';
import {
	WOOCOMMERCE_SERVICES_SHIPPING_METHOD_SCHEMA_REQUEST,
	WOOCOMMERCE_SERVICES_SHIPPING_METHOD_SCHEMA_REQUEST_SUCCESS,
} from 'woocommerce/woocommerce-services/state/action-types';
import { isShippingMethodSchemaLoaded, isShippingMethodSchemaLoading } from './selectors';

export const fetchShippingMethodSchemaSuccess = ( siteId, methodId, data ) => {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_METHOD_SCHEMA_REQUEST_SUCCESS,
		siteId,
		methodId,
		data,
	};
};

export const fetchShippingMethodSchema = ( siteId, methodId ) => ( dispatch, getState ) => {
	if (
		isShippingMethodSchemaLoaded( getState(), methodId, siteId ) ||
		isShippingMethodSchemaLoading( getState(), methodId, siteId )
	) {
		return;
	}

	const getAction = {
		type: WOOCOMMERCE_SERVICES_SHIPPING_METHOD_SCHEMA_REQUEST,
		methodId,
		siteId,
	};

	dispatch( getAction );

	return api
		.get( siteId, api.url.serviceSettings( methodId ) )
		.then( ( data ) => dispatch( fetchShippingMethodSchemaSuccess( siteId, methodId, data ) ) )
		.catch( ( err ) => dispatch( setError( siteId, getAction, err ) ) );
};
