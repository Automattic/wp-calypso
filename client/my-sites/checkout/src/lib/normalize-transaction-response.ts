import {
	WPCOMTransactionEndpointResponse,
	WPCOMTransactionEndpointResponseFailed,
} from '@automattic/wpcom-checkout';

const emptyResponse: WPCOMTransactionEndpointResponseFailed = {
	success: false,
	purchases: {},
	failed_purchases: {},
	receipt_id: 0,
	order_id: '',
	is_gift_purchase: false,
	display_price: '',
	price_integer: 0,
	price_float: 0,
	currency: 'USD',
	is_gravatar_domain: false,
};

export default function normalizeTransactionResponse(
	response: unknown
): WPCOMTransactionEndpointResponse {
	if ( ! response ) {
		return emptyResponse;
	}
	if ( isTransactionResponseValid( response ) ) {
		return response;
	}
	return emptyResponse;
}

function isTransactionResponseValid(
	response: unknown
): response is WPCOMTransactionEndpointResponse {
	const transactionResponse = response as WPCOMTransactionEndpointResponse;
	if ( 'redirect_url' in transactionResponse ) {
		return true;
	}
	if ( 'order_id' in transactionResponse ) {
		return true;
	}
	if ( 'message' in transactionResponse ) {
		return true;
	}
	if ( 'receipt_id' in transactionResponse && 'success' in transactionResponse ) {
		return true;
	}
	if ( 'failed_purchases' in transactionResponse && 'success' in transactionResponse ) {
		return true;
	}
	return false;
}
