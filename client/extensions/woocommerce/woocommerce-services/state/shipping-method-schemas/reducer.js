/**
 * Internal dependencies
 */

import { keyedReducer, withoutPersistence } from 'calypso/state/utils';
import {
	WOOCOMMERCE_SERVICES_SHIPPING_METHOD_SCHEMA_REQUEST,
	WOOCOMMERCE_SERVICES_SHIPPING_METHOD_SCHEMA_REQUEST_SUCCESS,
} from 'woocommerce/woocommerce-services/state/action-types';
import { LOADING } from 'woocommerce/state/constants';

const reducer = withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case WOOCOMMERCE_SERVICES_SHIPPING_METHOD_SCHEMA_REQUEST: {
			return LOADING;
		}
		case WOOCOMMERCE_SERVICES_SHIPPING_METHOD_SCHEMA_REQUEST_SUCCESS: {
			const { data } = action;
			return data;
		}
	}

	return state;
} );

export default keyedReducer( 'methodId', reducer );
