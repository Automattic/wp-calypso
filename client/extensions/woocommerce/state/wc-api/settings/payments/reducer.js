/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_API_FETCH_SETTINGS_PAYMENT_CURRENCY,
	WOOCOMMERCE_API_FETCH_SETTINGS_PAYMENT_CURRENCY_SUCCESS,
} from '../../../action-types';

export default {
	[ WOOCOMMERCE_API_FETCH_SETTINGS_PAYMENT_CURRENCY ]: fetchPaymentCurrency,
	[ WOOCOMMERCE_API_FETCH_SETTINGS_PAYMENT_CURRENCY_SUCCESS ]: fetchPaymentCurrencySuccess,
};

function fetchPaymentCurrency( siteData ) {
	// TODO: Update stats in the tree to show that this request is pending.
	return siteData;
}

function fetchPaymentCurrencySuccess( siteData, action ) {
	const { currency } = action.payload;
	return { ...siteData, currency: currency };
}
