/**
 * External dependencies
 */
import { isArray, noop } from 'lodash';
/**
 * Internal dependencies
 */
import {
	DEFAULT_QUERY,
	getNormalizedOrdersQuery,
	removeTemporaryIds,
	transformOrderForApi,
} from './utils';
import { getOrderStatusGroup } from 'woocommerce/lib/order-status';
import {
	WOOCOMMERCE_ORDER_DELETE,
	WOOCOMMERCE_ORDER_DELETE_FAILURE,
	WOOCOMMERCE_ORDER_DELETE_SUCCESS,
	WOOCOMMERCE_ORDER_REQUEST,
	WOOCOMMERCE_ORDER_REQUEST_FAILURE,
	WOOCOMMERCE_ORDER_REQUEST_SUCCESS,
	WOOCOMMERCE_ORDER_UPDATE,
	WOOCOMMERCE_ORDER_UPDATE_FAILURE,
	WOOCOMMERCE_ORDER_UPDATE_SUCCESS,
	WOOCOMMERCE_ORDERS_REQUEST,
	WOOCOMMERCE_ORDERS_REQUEST_FAILURE,
	WOOCOMMERCE_ORDERS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

export const deleteOrder = ( site, orderId ) => {
	return {
		type: WOOCOMMERCE_ORDER_DELETE,
		siteId: site.ID,
		siteSlug: site.slug,
		orderId,
	};
};

export const deleteOrderError = ( siteId, orderId, error ) => {
	return {
		type: WOOCOMMERCE_ORDER_DELETE_FAILURE,
		siteId,
		orderId,
		error,
	};
};
export const deleteOrderSuccess = ( siteId, orderId ) => {
	return {
		type: WOOCOMMERCE_ORDER_DELETE_SUCCESS,
		siteId,
		orderId,
	};
};

export const fetchOrders = ( siteId, requestedQuery = {} ) => {
	const query = { ...DEFAULT_QUERY, ...requestedQuery };
	// Convert URL status to status group
	query.status = getOrderStatusGroup( query.status );

	return {
		type: WOOCOMMERCE_ORDERS_REQUEST,
		siteId,
		query,
	};
};

export const failOrders = ( siteId, query = {}, error = false ) => {
	return {
		type: WOOCOMMERCE_ORDERS_REQUEST_FAILURE,
		siteId,
		query: getNormalizedOrdersQuery( query ),
		error,
	};
};

export const updateOrders = ( siteId, query = {}, orders = [], total = 0 ) => {
	// This passed through the API layer successfully, but failed at the remote site.
	if ( ! isArray( orders ) ) {
		return failOrders( siteId, query, orders );
	}
	return {
		type: WOOCOMMERCE_ORDERS_REQUEST_SUCCESS,
		siteId,
		query: getNormalizedOrdersQuery( query ),
		total,
		orders,
	};
};

export const fetchOrder = ( siteId, orderId ) => {
	return {
		type: WOOCOMMERCE_ORDER_REQUEST,
		siteId,
		orderId,
	};
};

export const failOrder = ( siteId, orderId, error = false ) => {
	return {
		type: WOOCOMMERCE_ORDER_REQUEST_FAILURE,
		siteId,
		orderId,
		error,
	};
};

export const updateOrder = ( siteId, orderId, order ) => {
	// This passed through the API layer successfully, but failed at the remote site.
	if ( 'undefined' === typeof order.id ) {
		return failOrder( siteId, orderId, order );
	}
	return {
		type: WOOCOMMERCE_ORDER_REQUEST_SUCCESS,
		siteId,
		orderId,
		order,
	};
};

export const saveOrder = (
	siteId,
	{ id: orderId, ...order },
	onSuccess = noop,
	onFailure = noop
) => {
	order = transformOrderForApi( removeTemporaryIds( order ) );
	return {
		type: WOOCOMMERCE_ORDER_UPDATE,
		siteId,
		orderId,
		order,
		onFailure,
		onSuccess,
	};
};

export const saveOrderError = ( siteId, orderId, error = false ) => {
	return {
		type: WOOCOMMERCE_ORDER_UPDATE_FAILURE,
		siteId,
		orderId,
		error,
	};
};

export const saveOrderSuccess = ( siteId, orderId, order = {} ) => {
	// This passed through the API layer successfully, but failed at the remote site.
	if ( 'undefined' === typeof order.id ) {
		return saveOrderError( siteId, orderId, order );
	}
	return {
		type: WOOCOMMERCE_ORDER_UPDATE_SUCCESS,
		siteId,
		orderId,
		order,
	};
};
