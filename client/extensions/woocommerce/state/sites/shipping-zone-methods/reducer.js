/**
 * Externals dependencies
 */
import { mapValues } from 'lodash';

/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_SHIPPING_ZONE_METHOD_UPDATED,
	WOOCOMMERCE_SHIPPING_ZONE_METHODS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import { WOOCOMMERCE_SERVICES_SHIPPING_ZONE_METHOD_SETTINGS_REQUEST_SUCCESS } from 'woocommerce/woocommerce-services/state/action-types';
import { withoutPersistence } from 'state/utils';

function handleRequestSuccess( state, { data } ) {
	const newState = { ...state };
	data.forEach( ( method ) => {
		newState[ method.id ] = {
			id: method.id,
			order: method.order,
			enabled: method.enabled,
			// The "method_id" prop name is very confusing, change it for "methodType":
			methodType: method.method_id,
			// We only care about the settings values, not their definitions
			...mapValues( method.settings, 'value' ),
		};
	} );

	return newState;
}

function handleMethodUpdated( state, { data, originatingAction } ) {
	if ( ! data.id ) {
		// WCS endpoints don't return the data on success, get that info from the originatingAction
		return {
			...state,
			[ originatingAction.methodId ]: {
				...state[ originatingAction.methodId ], // Preserve the previous method data
				id: originatingAction.methodId,
				methodType: originatingAction.methodType,
				...originatingAction.method,
			},
		};
	}
	return handleRequestSuccess( state, { data: [ data ] } );
}

function handleSettingsRequestSuccess( state, { instanceId, data } ) {
	return {
		...state,
		[ instanceId ]: {
			...state[ instanceId ],
			...data.formData,
		},
	};
}

export default withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case WOOCOMMERCE_SHIPPING_ZONE_METHODS_REQUEST_SUCCESS:
			return handleRequestSuccess( state, action );
		case WOOCOMMERCE_SHIPPING_ZONE_METHOD_UPDATED:
			return handleMethodUpdated( state, action );
		case WOOCOMMERCE_SERVICES_SHIPPING_ZONE_METHOD_SETTINGS_REQUEST_SUCCESS:
			return handleSettingsRequestSuccess( state, action );
	}
	return state;
} );
