/**
 * External dependencies
 */
import debugFactory from 'debug';
import { isFinite, omitBy } from 'lodash';
import { translate } from 'i18n-calypso';
import { stringify } from 'qs';

/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
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
import { fetchCounts } from 'woocommerce/state/sites/data/counts/actions';
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

export const del = ( action ) => {
	const { siteId, orderId } = action;
	return request( siteId, action ).del( `orders/${ orderId }` );
};

const onDeleteError = ( action, error ) => ( dispatch ) => {
	const { siteId, orderId } = action;
	dispatch( deleteOrderError( siteId, orderId, error ) );
	dispatch( errorNotice( translate( 'Unable to delete order.' ), { duration: 8000 } ) );
};

const onDeleteSuccess = ( action ) => ( dispatch ) => {
	const { siteId, siteSlug, orderId } = action;
	dispatch( deleteOrderSuccess( siteId, orderId ) );
	dispatch( fetchCounts( siteId ) );
	dispatch( navigate( `/store/orders/${ siteSlug }` ) );
	dispatch( successNotice( translate( 'Order deleted.' ), { duration: 8000 } ) );
};

export function apiError( action, error ) {
	debug( 'API Error: ', error );

	if ( action.failureAction ) {
		return { ...action.failureAction, error };
	}
}

export function requestOrders( action ) {
	const { siteId, query } = action;
	const queryString = stringify( omitBy( query, ( val ) => '' === val ) );
	action.failureAction = failOrders( siteId, query );

	return request( siteId, action ).getWithHeaders( `orders?${ queryString }` );
}

export function receivedOrders( action, { data } ) {
	const { siteId, query } = action;
	const { body, headers } = data;
	const total = Number( headers[ 'X-WP-Total' ] );

	return updateOrders( siteId, query, body, total );
}

export function requestOrder( action ) {
	const { siteId, orderId } = action;
	action.failureAction = failOrder( siteId, orderId );

	return request( siteId, action ).get( `orders/${ orderId }` );
}

export function receivedOrder( action, { data } ) {
	const { siteId, orderId } = action;
	return updateOrder( siteId, orderId, data );
}

export function sendOrder( action ) {
	const { siteId, orderId, order } = action;
	if ( isFinite( orderId ) ) {
		return request( siteId, action ).post( `orders/${ orderId }`, order );
	}
	return request( siteId, action ).post( 'orders', order );
}

export function onOrderSaveSuccess( action, { data } ) {
	return ( dispatch ) => {
		const { siteId, orderId } = action;
		// Make sure we have a success function, and a new order ID
		if ( 'function' === typeof action.onSuccess && 'undefined' !== typeof data.id ) {
			action.onSuccess( dispatch, data.id );
		}
		dispatch( fetchCounts( siteId ) );
		dispatch( saveOrderSuccess( siteId, orderId, data ) );
	};
}

export function onOrderSaveFailure( action, error ) {
	return ( dispatch ) => {
		const { siteId, orderId } = action;
		if ( 'function' === typeof action.onFailure ) {
			action.onFailure( dispatch );
		}
		debug( 'API Error: ', error );
		dispatch( saveOrderError( siteId, orderId, error ) );
	};
}

export default {
	[ WOOCOMMERCE_ORDER_DELETE ]: [
		dispatchRequest( {
			fetch: del,
			onSuccess: onDeleteSuccess,
			onError: onDeleteError,
			fromApi: verifyResponseHasData,
		} ),
	],
	[ WOOCOMMERCE_ORDER_REQUEST ]: [
		dispatchRequest( { fetch: requestOrder, onSuccess: receivedOrder, onError: apiError } ),
	],
	[ WOOCOMMERCE_ORDER_UPDATE ]: [
		dispatchRequest( {
			fetch: sendOrder,
			onSuccess: onOrderSaveSuccess,
			onError: onOrderSaveFailure,
		} ),
	],
	[ WOOCOMMERCE_ORDERS_REQUEST ]: [
		dispatchRequest( { fetch: requestOrders, onSuccess: receivedOrders, onError: apiError } ),
	],
};
