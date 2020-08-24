/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import {
	createNoteFailure,
	createNoteSuccess,
	fetchNotesFailure,
	fetchNotesSuccess,
} from 'woocommerce/state/sites/orders/notes/actions';
import request from 'woocommerce/state/sites/http-request';
import {
	WOOCOMMERCE_ORDER_NOTE_CREATE,
	WOOCOMMERCE_ORDER_NOTES_REQUEST,
} from 'woocommerce/state/action-types';
import { verifyResponseHasData } from 'woocommerce/state/data-layer/utils';

export const create = ( action ) => {
	const { siteId, orderId, note } = action;
	return request( siteId, action ).post( `orders/${ orderId }/notes`, note );
};

export const fetch = ( action ) => {
	const { siteId, orderId } = action;
	return request( siteId, action ).get( `orders/${ orderId }/notes` );
};

const onCreateError = ( action, error ) => ( dispatch ) => {
	const { siteId, orderId } = action;
	dispatch( createNoteFailure( siteId, orderId, error ) );
	if ( action.onFailure ) {
		dispatch( action.onFailure );
	}
};

const onCreateSuccess = ( action, { data } ) => ( dispatch ) => {
	const { siteId, orderId } = action;
	dispatch( createNoteSuccess( siteId, orderId, data ) );
	if ( action.onSuccess ) {
		dispatch( action.onSuccess );
	}
};

const onError = ( action, error ) => ( dispatch ) => {
	const { siteId, orderId } = action;
	dispatch( fetchNotesFailure( siteId, orderId, error ) );
	if ( action.onFailure ) {
		dispatch( action.onFailure );
	}
};

const onSuccess = ( action, { data } ) => ( dispatch ) => {
	const { siteId, orderId } = action;
	dispatch( fetchNotesSuccess( siteId, orderId, data ) );
	if ( action.onSuccess ) {
		dispatch( action.onSuccess );
	}
};

export default {
	[ WOOCOMMERCE_ORDER_NOTES_REQUEST ]: [
		dispatchRequest( {
			fetch,
			onSuccess,
			onError,
			fromApi: verifyResponseHasData,
		} ),
	],
	[ WOOCOMMERCE_ORDER_NOTE_CREATE ]: [
		dispatchRequest( {
			// fetch used in dispatchRequest to create the http request
			fetch: create,
			onSuccess: onCreateSuccess,
			onError: onCreateError,
			fromApi: verifyResponseHasData,
		} ),
	],
};
