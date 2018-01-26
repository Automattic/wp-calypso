/**
 * Internal dependencies
 */
import { WOOCOMMERCE_SERVICES_SHIPPING_ZONE_METHOD_UPDATE } from '../action-types';

export const SET_FORM_PROPERTY = 'SET_FORM_PROPERTY';
export const SET_ALL_PRISTINE = 'SET_ALL_PRISTINE';

export const setFormProperty = ( field, value ) => {
	return {
		type: SET_FORM_PROPERTY,
		field,
		value,
	};
};

export const setAllPristine = ( pristineValue ) => ( {
	type: SET_ALL_PRISTINE,
	pristineValue,
} );

export function updateWcsShippingZoneMethod(
	siteId,
	methodId,
	methodType,
	method,
	successAction,
	failureAction
) {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_ZONE_METHOD_UPDATE,
		siteId,
		methodId,
		methodType,
		method,
		successAction,
		failureAction,
	};
}
