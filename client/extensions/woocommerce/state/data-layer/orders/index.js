/** @format */
/**
 * External dependencies
 */
import debugFactory from 'debug';
import { isFinite, omitBy } from 'lodash';
import { translate } from 'i18n-calypso';
import qs from 'querystring';

/**
 * Internal dependencies
 */
import { dispatchRequest, dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import {
	deleteOrderError,
	deleteOrderSuccess,
	failOrder,
	failOrders,
	saveOrderError,
	saveOrderSuccess,
	updateOrder,
	updateOrders,
} from 'woocommerce/state/sites/orders/actions';
import { errorNotice, successNotice } from 'state/notices/actions';
import { navigate } from 'state/ui/actions';
import request from 'woocommerce/state/sites/http-request';
import {
	WOOCOMMERCE_ORDER_DELETE,
	WOOCOMMERCE_ORDER_REQUEST,
	WOOCOMMERCE_ORDER_UPDATE,
	WOOCOMMERCE_ORDERS_REQUEST,
} from 'woocommerce/state/action-types';
import { verifyResponseHasData } from 'woocommerce/state/data-layer/utils';

const debug = debugFactory( 'woocommerce:orders' );

export const del = action => {
	const { siteId, orderId } = action;
	return request( siteId, action ).del( `orders/${ orderId }` );
};

const onDeleteError = ( action, error ) => dispatch => {
	const { siteId, orderId } = action;
	dispatch( deleteOrderError( siteId, orderId, error ) );
	dispatch( errorNotice( translate( 'Unable to delete order.' ), { duration: 8000 } ) );
};

const onDeleteSuccess = action => dispatch => {
	const { siteId, siteSlug, orderId } = action;
	dispatch( deleteOrderSuccess( siteId, orderId ) );
	dispatch( navigate( `/store/orders/${ siteSlug }` ) );
	dispatch( successNotice( translate( 'Order deleted.' ), { duration: 8000 } ) );
};

export default {
	[ WOOCOMMERCE_ORDER_DELETE ]: [
		dispatchRequestEx( {
			fetch: del,
			onSuccess: onDeleteSuccess,
			onError: onDeleteError,
			fromApi: verifyResponseHasData,
		} ),
	],
	[ WOOCOMMERCE_ORDER_REQUEST ]: [ dispatchRequest( requestOrder, receivedOrder, apiError ) ],
	[ WOOCOMMERCE_ORDER_UPDATE ]: [
		dispatchRequest( sendOrder, onOrderSaveSuccess, onOrderSaveFailure ),
	],
	[ WOOCOMMERCE_ORDERS_REQUEST ]: [ dispatchRequest( requestOrders, receivedOrders, apiError ) ],
};

export function apiError( { dispatch }, action, error ) {
	debug( 'API Error: ', error );

	if ( action.failureAction ) {
		dispatch( { ...action.failureAction, error } );
	}
}

export function requestOrders( { dispatch }, action ) {
	const { siteId, query } = action;
	const queryString = qs.stringify( omitBy( query, val => '' === val ) );
	action.failureAction = failOrders( siteId, query );

	dispatch( request( siteId, action ).getWithHeaders( `orders?${ queryString }` ) );
}

export function receivedOrders( { dispatch }, action, { data } ) {
	const { siteId, query } = action;
	const { body, headers } = data;
	const total = Number( headers[ 'X-WP-Total' ] );

	dispatch( updateOrders( siteId, query, body, total ) );
}

export function requestOrder( { dispatch }, action ) {
	const { siteId, orderId } = action;
	action.failureAction = failOrder( siteId, orderId );

	dispatch( request( siteId, action ).get( `orders/${ orderId }` ) );
}

export function receivedOrder( { dispatch }, action, { data } ) {
	const { siteId, orderId } = action;
	dispatch( updateOrder( siteId, orderId, data ) );
}

export function sendOrder( { dispatch }, action ) {
	const { siteId, orderId, order } = action;
	if ( isFinite( orderId ) ) {
		dispatch( request( siteId, action ).post( `orders/${ orderId }`, order ) );
	} else {
		dispatch( request( siteId, action ).post( 'orders', order ) );
	}
}

export function onOrderSaveSuccess( { dispatch }, action, { data } ) {
	const { siteId, orderId } = action;
	// Make sure we have a success function, and a new order ID
	if ( 'function' === typeof action.onSuccess && 'undefined' !== typeof data.id ) {
		action.onSuccess( dispatch, data.id );
	}
	dispatch( saveOrderSuccess( siteId, orderId, data ) );
}

export function onOrderSaveFailure( { dispatch }, action, error ) {
	const { siteId, orderId } = action;
	if ( 'function' === typeof action.onFailure ) {
		action.onFailure( dispatch );
	}
	debug( 'API Error: ', error );
	dispatch( saveOrderError( siteId, orderId, error ) );
}
