/** @format */
/**
 * External dependencies
 */
import debugFactory from 'debug';
import { omitBy } from 'lodash';
import qs from 'querystring';

/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import {
	failOrder,
	failOrders,
	saveOrderError,
	saveOrderSuccess,
	updateOrder,
	updateOrders,
} from 'woocommerce/state/sites/orders/actions';
import request from 'woocommerce/state/sites/http-request';
import { successNotice, errorNotice } from 'state/notices/actions';
import { translate } from 'i18n-calypso';
import {
	WOOCOMMERCE_ORDER_REQUEST,
	WOOCOMMERCE_ORDER_UPDATE,
	WOOCOMMERCE_ORDERS_REQUEST,
} from 'woocommerce/state/action-types';

const debug = debugFactory( 'woocommerce:orders' );

export default {
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
	dispatch( request( siteId, action ).post( `orders/${ orderId }`, order ) );
}

export function onOrderSaveSuccess( { dispatch }, action, { data } ) {
	const { siteId, orderId } = action;
	dispatch( successNotice( translate( 'Order saved.' ), { duration: 5000 } ) );
	dispatch( saveOrderSuccess( siteId, orderId, data ) );
}

export function onOrderSaveFailure( { dispatch }, action, error ) {
	const { siteId, orderId } = action;
	debug( 'API Error: ', error );
	dispatch( errorNotice( translate( 'Unable to save order.' ), { duration: 5000 } ) );
	dispatch( saveOrderError( siteId, orderId, error ) );
}
