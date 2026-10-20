import { wpcom } from './wpcom-fetcher';

export type TransactionOrderStatus =
	'error' | 'processing' | 'async-pending' | 'payment-confirmed' | 'payment-failure' | 'success';

/**
 * An order created by `/me/transactions`, whose payment may still be in progress.
 */
export interface TransactionOrder {
	order_id: number;
	user_id: number;
	receipt_id: number | undefined;
	processing_status: TransactionOrderStatus;
	/**
	 * On a Stripe `payment-failure`, the backend returns a customer-facing
	 * failure code and an already-translated message, matching what synchronous
	 * card failures return. Both are absent on non-Stripe or non-failure orders.
	 * See SHILL-1811.
	 */
	error_code?: string;
	error_message?: string;
}

export async function fetchTransactionOrder( orderId: number ): Promise< TransactionOrder > {
	return await wpcom.req.get( {
		path: `/me/transactions/order/${ orderId }`,
		apiVersion: '1.1',
	} );
}
