/**
 * Internal dependencies
 */
import { withoutPersistence } from 'state/utils';
import {
	WOOCOMMERCE_SERVICES_SHIPPING_ZONE_METHOD_SETTINGS_REQUEST,
	WOOCOMMERCE_SERVICES_SHIPPING_ZONE_METHOD_SETTINGS_REQUEST_SUCCESS,
} from 'woocommerce/woocommerce-services/state/action-types';
import { LOADING } from 'woocommerce/state/constants';
import { WOOCOMMERCE_SHIPPING_ZONE_METHOD_UPDATED } from 'woocommerce/state/action-types';

export default withoutPersistence( function ( state = {}, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_SERVICES_SHIPPING_ZONE_METHOD_SETTINGS_REQUEST:
			return {
				...state,
				[ action.instanceId ]: LOADING,
			};

		case WOOCOMMERCE_SERVICES_SHIPPING_ZONE_METHOD_SETTINGS_REQUEST_SUCCESS:
			return {
				...state,
				[ action.instanceId ]: true,
			};

		case WOOCOMMERCE_SHIPPING_ZONE_METHOD_UPDATED:
			return {
				...state,
				[ action.data.id ]: true,
			};
	}

	return state;
} );
