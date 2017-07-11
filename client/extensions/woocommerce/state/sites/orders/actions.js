/**
 * Internal dependencies
 */
import {
	areOrdersLoaded,
	areOrdersLoading,
	isOrderLoaded,
	isOrderLoading,
} from './selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import request from '../request';
import { setError } from '../status/wc-api/actions';
import { successNotice, errorNotice } from 'state/notices/actions';
import { translate } from 'i18n-calypso';
import {
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

export const fetchOrders = ( siteId, page = 1 ) => ( dispatch, getState ) => {
	const state = getState();
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}
	if ( areOrdersLoaded( state, page, siteId ) || areOrdersLoading( state, page, siteId ) ) {
		return;
	}

	const fetchAction = {
		type: WOOCOMMERCE_ORDERS_REQUEST,
		siteId,
		page,
	};
	dispatch( fetchAction );

	return request( siteId ).getWithHeaders( `orders?page=${ page }&per_page=100` ).then( ( response ) => {
		const { headers, data } = response;
		const totalPages = headers[ 'X-WP-TotalPages' ];
		dispatch( {
			type: WOOCOMMERCE_ORDERS_REQUEST_SUCCESS,
			siteId,
			page,
			totalPages,
			orders: data,
		} );
	} ).catch( error => {
		dispatch( setError( siteId, fetchAction, error ) );
		dispatch( {
			type: WOOCOMMERCE_ORDERS_REQUEST_FAILURE,
			siteId,
			page,
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
