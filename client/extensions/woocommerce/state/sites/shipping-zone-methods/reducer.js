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

function addMethodsToState( state, methods ) {
	const nextState = { ...state };
	methods.forEach( method => {
		nextState[ method.id ] = {
			id: method.id,
			order: method.order,
			enabled: method.enabled,
			// The "method_id" prop name is very confusing, change it for "methodType":
			methodType: method.method_id,
			// We only care about the settings values, not their definitions
			...mapValues( method.settings, 'value' ),
		};
	} );
	return nextState;
}

export default function( state = {}, action ) {
	switch ( action.type ) {
		case WOOCOMMERCE_SHIPPING_ZONE_METHODS_REQUEST_SUCCESS:
			return addMethodsToState( state, action.data );

		case WOOCOMMERCE_SHIPPING_ZONE_METHOD_UPDATED:
			if ( ! action.data.id ) {
				// WCS endpoints don't return the data on success, get that info from the originatingAction
				return {
					...state,
					[ action.originatingAction.methodId ]: {
						...state[ action.originatingAction.methodId ], // Preserve the previous method data
						id: action.originatingAction.methodId,
						methodType: action.originatingAction.methodType,
						...action.originatingAction.method,
					},
				};
			}
			return addMethodsToState( state, [ action.data ] );

		case WOOCOMMERCE_SERVICES_SHIPPING_ZONE_METHOD_SETTINGS_REQUEST_SUCCESS:
			return {
				...state,
				[ action.instanceId ]: {
					...state[ action.instanceId ],
					...action.data.formData,
				},
			};
	}
	return state;
}
