/**
 * Internal dependencies
 */
import {
	areOrdersLoaded,
	areOrdersLoading,
	isOrderLoaded,
	isOrderLoading,
	isOrderRefunding,
} from './selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import request from '../request';
import { setError } from '../status/wc-api/actions';
import { successNotice, errorNotice } from 'state/notices/actions';
import { translate } from 'i18n-calypso';
import {
	WOOCOMMERCE_ORDER_REFUND_REQUEST,
	WOOCOMMERCE_ORDER_REFUND_REQUEST_SUCCESS,
	WOOCOMMERCE_ORDER_REFUND_REQUEST_FAILURE,
	WOOCOMMERCE_ORDER_REQUEST,
	WOOCOMMERCE_ORDER_REQUEST_FAILURE,
	WOOCOMMERCE_ORDER_REQUEST_SUCCESS,
	WOOCOMMERCE_ORDERS_REQUEST,
	WOOCOMMERCE_ORDERS_REQUEST_FAILURE,
	WOOCOMMERCE_ORDERS_REQUEST_SUCCESS,
} from '../../action-types';

export const fetchOrders = ( siteId, page ) => ( dispatch, getState ) => {
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

export const fetchOrder = ( siteId, orderId ) => ( dispatch, getState ) => {
	const state = getState();
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}
	if ( isOrderLoaded( state, orderId, siteId ) || isOrderLoading( state, orderId, siteId ) ) {
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

export const sendRefund = ( siteId, orderId, refund ) => ( dispatch, getState ) => {
	const state = getState();
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}
	if ( isOrderRefunding( state, orderId, siteId ) ) {
		return;
	}

	dispatch( {
		type: WOOCOMMERCE_ORDER_REFUND_REQUEST,
		siteId,
		orderId,
	} );

	return request( siteId ).post( `orders/${ orderId }/refunds`, refund ).then( () => {
		dispatch( successNotice( translate( 'Refund granted.' ), { duration: 5000 } ) );
		dispatch( fetchOrder( siteId, orderId ) );
		dispatch( {
			type: WOOCOMMERCE_ORDER_REFUND_REQUEST_SUCCESS,
			siteId,
			orderId,
		} );
	} ).catch( error => {
		dispatch( errorNotice( translate( 'Unable to grant refund.' ), { duration: 5000 } ) );
		dispatch( {
			type: WOOCOMMERCE_ORDER_REFUND_REQUEST_FAILURE,
			siteId,
			orderId,
			error,
		} );
	} );
};
