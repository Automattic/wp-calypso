/**
 * External dependencies
 */
import { WPCOMTransactionEndpointResponse } from '@automattic/wpcom-checkout';

const emptyResponse: WPCOMTransactionEndpointResponse = {
	success: false,
	error_code: '',
	error_message: '',
};

export default function normalizeTransactionResponse(
	response: unknown
): WPCOMTransactionEndpointResponse {
	if ( ! response ) {
		return emptyResponse;
	}
	const transactionResponse = response as WPCOMTransactionEndpointResponse;
	if (
		transactionResponse.message ||
		transactionResponse.order_id ||
		transactionResponse.receipt_id ||
		transactionResponse.purchases ||
		transactionResponse.failed_purchases ||
		transactionResponse.redirect_url
	) {
		return transactionResponse;
	}
	return emptyResponse;
}
