/** @format */
/**
 * Internal dependencies
 */
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import {
	orderInvoiceFailure,
	orderInvoiceSuccess,
} from 'woocommerce/state/sites/orders/send-invoice/actions';
import request from 'woocommerce/state/sites/http-request';
import { WOOCOMMERCE_ORDER_INVOICE_SEND } from 'woocommerce/state/action-types';

export const fetch = action => {
	const { siteId, orderId } = action;
	return request( siteId, action ).post( `orders/${ orderId }/send_invoice`, {} );
};

export const onError = ( { siteId, orderId }, error ) =>
	orderInvoiceFailure( siteId, orderId, error );

export const onSuccess = ( { siteId, orderId }, { data } ) =>
	orderInvoiceSuccess( siteId, orderId, data );

export default {
	[ WOOCOMMERCE_ORDER_INVOICE_SEND ]: [ dispatchRequestEx( { fetch, onSuccess, onError } ) ],
};
