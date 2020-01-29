/**
 * Internal dependencies
 */
import {
	WOOCOMMERCE_ORDER_INVOICE_SEND_FAILURE,
	WOOCOMMERCE_ORDER_INVOICE_SEND,
	WOOCOMMERCE_ORDER_INVOICE_SEND_SUCCESS,
} from 'woocommerce/state/action-types';

export const sendOrderInvoice = ( siteId, orderId, onSuccess, onFailure ) => {
	return {
		type: WOOCOMMERCE_ORDER_INVOICE_SEND,
		siteId,
		orderId,
		onSuccess,
		onFailure,
	};
};

export const orderInvoiceFailure = ( siteId, orderId, error = {} ) => {
	return {
		type: WOOCOMMERCE_ORDER_INVOICE_SEND_FAILURE,
		siteId,
		orderId,
		error,
	};
};

export const orderInvoiceSuccess = ( siteId, orderId, note ) => {
	return {
		type: WOOCOMMERCE_ORDER_INVOICE_SEND_SUCCESS,
		siteId,
		orderId,
		note,
	};
};
