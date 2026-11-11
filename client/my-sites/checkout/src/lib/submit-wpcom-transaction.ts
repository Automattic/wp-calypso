import { createTransaction } from '@automattic/api-core';
import { createWpcomAccountBeforeTransaction } from './create-wpcom-account-before-transaction';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type {
	WPCOMTransactionEndpointRequestPayload,
	WPCOMTransactionEndpointResponse,
} from '@automattic/wpcom-checkout';

/**
 * Submit a transaction to the WPCOM transactions endpoint.
 *
 * This is one of two transactions endpoint functions; also see
 * `wpcomPayPalExpress`.
 *
 * Please do not alter payload inside this function if possible to retain type
 * safety. Instead, alter `createTransactionEndpointRequestPayload` or add a
 * new type safe function that works similarly (see
 * `createWpcomAccountBeforeTransaction`).
 */
export default async function submitWpcomTransaction(
	payload: WPCOMTransactionEndpointRequestPayload,
	transactionOptions: PaymentProcessorOptions
): Promise< WPCOMTransactionEndpointResponse > {
	if ( transactionOptions.createUserAndSiteBeforeTransaction ) {
		payload.cart = await createWpcomAccountBeforeTransaction( payload.cart, transactionOptions );
	}

	return createTransaction( payload );
}
