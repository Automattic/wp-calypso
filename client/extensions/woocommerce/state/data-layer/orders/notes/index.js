/** @format */
/**
 * Internal dependencies
 */
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { fetchNotesFailure, fetchNotesSuccess } from 'woocommerce/state/sites/orders/notes/actions';
import request from 'woocommerce/state/sites/http-request';
import {
	// WOOCOMMERCE_ORDER_NOTE_CREATE,
	WOOCOMMERCE_ORDER_NOTES_REQUEST,
} from 'woocommerce/state/action-types';
import { verifyResponseHasData } from 'woocommerce/state/data-layer/utils';

export const fetch = action => {
	const { siteId, orderId } = action;
	return request( siteId, action ).get( `orders/${ orderId }/notes` );
};

const onError = ( action, error ) => dispatch => {
	const { siteId, orderId } = action;
	dispatch( fetchNotesFailure( siteId, orderId, error ) );
	if ( action.onFailure ) {
		dispatch( action.onFailure );
	}
};

const onSuccess = ( action, { data } ) => dispatch => {
	const { siteId, orderId } = action;
	dispatch( fetchNotesSuccess( siteId, orderId, data ) );
	if ( action.onSuccess ) {
		dispatch( action.onSuccess );
	}
};

export default {
	[ WOOCOMMERCE_ORDER_NOTES_REQUEST ]: [
		dispatchRequestEx( {
			fetch,
			onSuccess,
			onError,
			fromApi: verifyResponseHasData,
		} ),
	],
	// [ WOOCOMMERCE_ORDER_NOTE_CREATE ] : [
	//	dispatchRequestEx( { fetch, onSuccess, onError, fromApi: verifyResponseHasData } ),
	// ]
};
