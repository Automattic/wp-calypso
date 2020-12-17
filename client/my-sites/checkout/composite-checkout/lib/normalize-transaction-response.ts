/**
 * Internal dependencies
 */
import { TransactionResponse } from 'calypso/my-sites/checkout/composite-checkout/types/wpcom-store-state';

export default function normalizeTransactionResponse( response: unknown ): TransactionResponse {
	if ( ! response ) {
		return {};
	}
	const transactionResponse = response as TransactionResponse;
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
	return {};
}
