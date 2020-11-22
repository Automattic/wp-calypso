/**
 * Internal dependencies
 */
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { translate } from 'i18n-calypso';
import {
	WOOCOMMERCE_ORDER_REFUND_CREATE,
	WOOCOMMERCE_ORDER_REFUND_CREATE_SUCCESS,
	WOOCOMMERCE_ORDER_REFUND_CREATE_FAILURE,
	WOOCOMMERCE_ORDER_REFUNDS_REQUEST,
	WOOCOMMERCE_ORDER_REFUNDS_REQUEST_SUCCESS,
	WOOCOMMERCE_ORDER_REFUNDS_REQUEST_FAILURE,
} from 'woocommerce/state/action-types';

export const sendRefund = ( siteId, orderId, refund, onSuccess = false, onFailure = false ) => {
	if ( ! onFailure ) {
		onFailure = errorNotice( translate( 'Unable to grant refund.' ), { duration: 5000 } );
	}
	if ( ! onSuccess ) {
		onSuccess = successNotice( translate( 'Refund granted.' ), { duration: 5000 } );
	}

	return {
		type: WOOCOMMERCE_ORDER_REFUND_CREATE,
		siteId,
		orderId,
		refund,
		onSuccess,
		onFailure,
	};
};

export const createRefundFailure = ( siteId, orderId, error = {} ) => {
	return {
		type: WOOCOMMERCE_ORDER_REFUND_CREATE_FAILURE,
		siteId,
		orderId,
		error,
	};
};

export const createRefundSuccess = ( siteId, orderId, refund ) => {
	return {
		type: WOOCOMMERCE_ORDER_REFUND_CREATE_SUCCESS,
		siteId,
		orderId,
		refund,
	};
};

export const fetchRefunds = ( siteId, orderId ) => {
	return {
		type: WOOCOMMERCE_ORDER_REFUNDS_REQUEST,
		siteId,
		orderId,
	};
};

export const fetchRefundsFailure = ( siteId, orderId, error = {} ) => {
	return {
		type: WOOCOMMERCE_ORDER_REFUNDS_REQUEST_FAILURE,
		siteId,
		orderId,
		error,
	};
};

export const fetchRefundsSuccess = ( siteId, orderId, refunds ) => {
	return {
		type: WOOCOMMERCE_ORDER_REFUNDS_REQUEST_SUCCESS,
		siteId,
		orderId,
		refunds,
	};
};
