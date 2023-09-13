import { WPCOMTransactionEndpointResponse } from '@automattic/wpcom-checkout';

export interface FailedResponse {
	success: false;
}

const emptyResponse: FailedResponse = {
	success: false,
};

export default function normalizeTransactionResponse(
	response: unknown
): WPCOMTransactionEndpointResponse | FailedResponse {
	if ( ! response ) {
		return emptyResponse;
	}
	const transactionResponse = response as WPCOMTransactionEndpointResponse;
	if (
		( 'message' in transactionResponse && transactionResponse.message ) ||
		transactionResponse.order_id ||
		( 'receipt_id' in transactionResponse && transactionResponse.receipt_id ) ||
		( 'purchases' in transactionResponse && transactionResponse.purchases ) ||
		( 'failed_purchases' in transactionResponse && transactionResponse.failed_purchases ) ||
		transactionResponse.redirect_url
	) {
		return transactionResponse;
	}
	return emptyResponse;
}
