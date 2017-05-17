/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_API_FETCH_SETTINGS_PAYMENT_METHODS,
	WOOCOMMERCE_API_FETCH_SETTINGS_PAYMENT_METHODS_SUCCESS,
} from '../../../action-types';

export default {
	[ WOOCOMMERCE_API_FETCH_SETTINGS_PAYMENT_METHODS ]: fetchPaymentMethods,
	[ WOOCOMMERCE_API_FETCH_SETTINGS_PAYMENT_METHODS_SUCCESS ]: fetchPaymentMethodsSuccess,
};

function fetchPaymentMethods( siteData ) {
	// TODO: Update stats in the tree to show that this request is pending.
	return siteData;
}

function fetchPaymentMethodsSuccess( siteData, action ) {
	const { paymentMethods } = action.payload;
	return { ...siteData, paymentMethods };
}
