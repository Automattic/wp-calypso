/**
 * Internal dependencies
 */
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import {
	JETPACK_CHECKOUT_UPDATE_SUPPORT_TICKET_RECEIVE,
	JETPACK_CHECKOUT_UPDATE_SUPPORT_TICKET_REQUEST,
	JETPACK_CHECKOUT_UPDATE_SUPPORT_TICKET_REQUEST_FAILURE,
	JETPACK_CHECKOUT_UPDATE_SUPPORT_TICKET_REQUEST_SUCCESS,
} from 'calypso/state/action-types';

const updateSupportTicket = ( action ) => {
	const { siteUrl, receiptId } = action;
	return http(
		{
			method: 'POST',
			path: '/jetpack-checkout/support-ticket',
			apiNamespace: 'wpcom/v2',
			body: { site_url: siteUrl, receipt_id: receiptId },
		},
		action
	);
};

const onUpdateSuccess = ( action, response ) => {
	return [
		{
			type: JETPACK_CHECKOUT_UPDATE_SUPPORT_TICKET_REQUEST_SUCCESS,
			receiptId: action.receiptId,
		},
		{
			type: JETPACK_CHECKOUT_UPDATE_SUPPORT_TICKET_RECEIVE,
			receiptId: action.receiptId,
			payload: response,
		},
	];
};

const onUpdateError = ( response ) => {
	return [
		{
			type: JETPACK_CHECKOUT_UPDATE_SUPPORT_TICKET_REQUEST_FAILURE,
			receiptId: response.receiptId,
		},
	];
};

registerHandlers( 'state/data-layer/wpcom/jetpack-checkout/support-ticket/index.js', {
	[ JETPACK_CHECKOUT_UPDATE_SUPPORT_TICKET_REQUEST ]: [
		dispatchRequest( {
			fetch: updateSupportTicket,
			onSuccess: onUpdateSuccess,
			onError: onUpdateError,
		} ),
	],
} );
