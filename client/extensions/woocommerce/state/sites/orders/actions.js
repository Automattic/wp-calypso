/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { omitBy } from 'lodash';

/**
 * Internal dependencies
 */
import request from '../request';
import { setError } from '../status/wc-api/actions';
import { areOrdersLoaded, areOrdersLoading, isOrderLoaded, isOrderLoading } from './selectors';
import { DEFAULT_QUERY, getNormalizedOrdersQuery } from './utils';
import qs from 'querystring';
import { successNotice, errorNotice } from 'state/notices/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { ORDER_UNPAID, ORDER_UNFULFILLED, ORDER_COMPLETED, statusWaitingPayment, statusWaitingFulfillment, statusFinished } from 'woocommerce/lib/order-status';
import { WOOCOMMERCE_ORDER_REQUEST, WOOCOMMERCE_ORDER_REQUEST_FAILURE, WOOCOMMERCE_ORDER_REQUEST_SUCCESS, WOOCOMMERCE_ORDER_UPDATE, WOOCOMMERCE_ORDER_UPDATE_FAILURE, WOOCOMMERCE_ORDER_UPDATE_SUCCESS, WOOCOMMERCE_ORDERS_REQUEST, WOOCOMMERCE_ORDERS_REQUEST_FAILURE, WOOCOMMERCE_ORDERS_REQUEST_SUCCESS } from 'woocommerce/state/action-types';

export const fetchOrders = ( siteId, requestedQuery = {} ) => ( dispatch, getState ) => {
	const state = getState();
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}

	const query = { ...DEFAULT_QUERY, ...requestedQuery };
	const normalizedQuery = getNormalizedOrdersQuery( requestedQuery );
	if ( areOrdersLoaded( state, query, siteId ) || areOrdersLoading( state, query, siteId ) ) {
		return;
	}

	const fetchAction = {
		type: WOOCOMMERCE_ORDERS_REQUEST,
		siteId,
		query: normalizedQuery,
	};
	dispatch( fetchAction );

	// Convert URL status to status group
	if ( ORDER_UNPAID === query.status ) {
		query.status = statusWaitingPayment.join( ',' );
	} else if ( ORDER_UNFULFILLED === query.status ) {
		query.status = statusWaitingFulfillment.join( ',' );
	} else if ( ORDER_COMPLETED === query.status ) {
		query.status = statusFinished.join( ',' );
	}

	const queryString = qs.stringify( omitBy( query, val => '' === val ) );
	return request( siteId ).getWithHeaders( 'orders?' + queryString ).then( ( response ) => {
		const { headers, data } = response;
		const total = headers[ 'X-WP-Total' ];
		dispatch( {
			type: WOOCOMMERCE_ORDERS_REQUEST_SUCCESS,
			siteId,
			query: normalizedQuery,
			total,
			orders: data,
		} );
	} ).catch( error => {
		dispatch( setError( siteId, fetchAction, error ) );
		dispatch( {
			type: WOOCOMMERCE_ORDERS_REQUEST_FAILURE,
			siteId,
			query: normalizedQuery,
			error,
		} );
	} );
};

export const fetchOrder = ( siteId, orderId, refresh = false ) => ( dispatch, getState ) => {
	const state = getState();
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}
	if ( isOrderLoading( state, orderId, siteId ) ) {
		return;
	}
	// Bail if the order is loaded, and we don't want to force a refresh
	if ( ! refresh && isOrderLoaded( state, orderId, siteId ) ) {
		return;
	}

	const fetchAction = {
		type: WOOCOMMERCE_ORDER_REQUEST,
		siteId,
		orderId,
	};
	dispatch( fetchAction );

	return request( siteId ).get( `orders/${ orderId }` ).then( order => {
		dispatch( {
			type: WOOCOMMERCE_ORDER_REQUEST_SUCCESS,
			siteId,
			orderId,
			order,
		} );
	} ).catch( error => {
		dispatch( setError( siteId, fetchAction, error ) );
		dispatch( {
			type: WOOCOMMERCE_ORDER_REQUEST_FAILURE,
			siteId,
			orderId,
			error,
		} );
	} );
};

export const updateOrder = ( siteId, { id: orderId, ...order } ) => ( dispatch, getState ) => {
	const state = getState();
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}

	const updateAction = {
		type: WOOCOMMERCE_ORDER_UPDATE,
		siteId,
		orderId,
	};
	dispatch( updateAction );

	return request( siteId ).post( `orders/${ orderId }`, order ).then( data => {
		dispatch( successNotice( translate( 'Order saved.' ), { duration: 5000 } ) );
		dispatch( {
			type: WOOCOMMERCE_ORDER_UPDATE_SUCCESS,
			siteId,
			orderId,
			order: data,
		} );
	} ).catch( error => {
		dispatch( setError( siteId, updateAction, error ) );
		dispatch( errorNotice( translate( 'Unable to save order.' ), { duration: 5000 } ) );
		dispatch( {
			type: WOOCOMMERCE_ORDER_UPDATE_FAILURE,
			siteId,
			orderId,
			error,
		} );
	} );
};
