import { mapRecordKeysRecursively, camelToSnakeCase } from '@automattic/js-utils';
import getToSAcceptancePayload from 'calypso/lib/tos-acceptance-tracking';
import wp from 'calypso/lib/wp';
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
 * Note that the payload property is (mostly) in camelCase but the actual
 * submitted data will be converted (mostly) to snake_case.
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
	const isJetpackUserLessCheckout =
		payload.cart.is_jetpack_checkout && payload.cart.cart_key === 'no-user';

	if ( transactionOptions.createUserAndSiteBeforeTransaction || isJetpackUserLessCheckout ) {
		payload.cart = await createWpcomAccountBeforeTransaction( payload.cart, transactionOptions );
	}

	return wp.req.post(
		'/me/transactions',
		mapRecordKeysRecursively(
			{
				...payload,
				tos: getToSAcceptancePayload(),
			},
			camelToSnakeCase
		)
	);
}
