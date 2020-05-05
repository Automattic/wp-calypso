/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import {
	fetchRefundsFailure,
	fetchRefundsSuccess,
	createRefundFailure,
	createRefundSuccess,
} from 'woocommerce/state/sites/orders/refunds/actions';
import { fetchNotes } from 'woocommerce/state/sites/orders/notes/actions';
import { fetchOrder } from 'woocommerce/state/sites/orders/actions';
import request from 'woocommerce/state/sites/http-request';
import {
	WOOCOMMERCE_ORDER_REFUND_CREATE,
	WOOCOMMERCE_ORDER_REFUNDS_REQUEST,
} from 'woocommerce/state/action-types';
import { verifyResponseHasData } from 'woocommerce/state/data-layer/utils';

export const create = ( action ) => {
	const { siteId, orderId, refund } = action;
	return request( siteId, action ).post( `orders/${ orderId }/refunds`, refund );
};

const onCreateError = ( action, error ) => ( dispatch ) => {
	const { siteId, orderId } = action;
	dispatch( createRefundFailure( siteId, orderId, error ) );
	if ( action.onFailure ) {
		dispatch( action.onFailure );
	}
};

const onCreateSuccess = ( action, { data } ) => ( dispatch ) => {
	const { siteId, orderId } = action;
	dispatch( createRefundSuccess( siteId, orderId, data ) );
	// Success! Re-fetch order & notes
	dispatch( fetchOrder( siteId, orderId ) );
	dispatch( fetchNotes( siteId, orderId ) );
	if ( action.onSuccess ) {
		dispatch( action.onSuccess );
	}
};

export const fetch = ( action ) => {
	const { siteId, orderId } = action;
	return request( siteId, action ).get( `orders/${ orderId }/refunds` );
};

const onError = ( action, error ) => ( dispatch ) => {
	const { siteId, orderId } = action;
	dispatch( fetchRefundsFailure( siteId, orderId, error ) );
};

const onSuccess = ( action, { data } ) => ( dispatch ) => {
	const { siteId, orderId } = action;
	dispatch( fetchRefundsSuccess( siteId, orderId, data ) );
};

export default {
	[ WOOCOMMERCE_ORDER_REFUND_CREATE ]: [
		dispatchRequest( {
			// fetch used in dispatchRequest to create the http request
			fetch: create,
			onSuccess: onCreateSuccess,
			onError: onCreateError,
			fromApi: verifyResponseHasData,
		} ),
	],
	[ WOOCOMMERCE_ORDER_REFUNDS_REQUEST ]: [
		dispatchRequest( {
			// fetch used in dispatchRequest to create the http request
			fetch,
			onSuccess,
			onError,
			fromApi: verifyResponseHasData,
		} ),
	],
};
