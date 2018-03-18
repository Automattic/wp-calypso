/** @format */
/**
 * Internal dependencies
 */
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import {
	createRefundFailure,
	createRefundSuccess,
} from 'woocommerce/state/sites/orders/refunds/actions';
import { fetchNotes } from 'woocommerce/state/sites/orders/notes/actions';
import { fetchOrder } from 'woocommerce/state/sites/orders/actions';
import request from 'woocommerce/state/sites/http-request';
import { WOOCOMMERCE_ORDER_REFUND_CREATE } from 'woocommerce/state/action-types';
import { verifyResponseHasData } from 'woocommerce/state/data-layer/utils';

export const create = action => {
	const { siteId, orderId, refund } = action;
	return request( siteId, action ).post( `orders/${ orderId }/refunds`, refund );
};

const onCreateError = ( action, error ) => dispatch => {
	const { siteId, orderId } = action;
	dispatch( createRefundFailure( siteId, orderId, error ) );
	if ( action.onFailure ) {
		dispatch( action.onFailure );
	}
};

const onCreateSuccess = ( action, { data } ) => dispatch => {
	const { siteId, orderId } = action;
	dispatch( createRefundSuccess( siteId, orderId, data ) );
	// Success! Re-fetch order & notes
	dispatch( fetchOrder( siteId, orderId ) );
	dispatch( fetchNotes( siteId, orderId ) );
	if ( action.onSuccess ) {
		dispatch( action.onSuccess );
	}
};

export default {
	[ WOOCOMMERCE_ORDER_REFUND_CREATE ]: [
		dispatchRequestEx( {
			// fetch used in dispatchRequestEx to create the http request
			fetch: create,
			onSuccess: onCreateSuccess,
			onError: onCreateError,
			fromApi: verifyResponseHasData,
		} ),
	],
};
