import { mapRecordKeysRecursively, camelToSnakeCase } from '@automattic/wpcom-checkout';
import wp from 'calypso/lib/wp';
import { createAccount } from '../payment-method-helpers';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type {
	WPCOMTransactionEndpointRequestPayload,
	WPCOMTransactionEndpointResponse,
} from '@automattic/wpcom-checkout';

export default async function submitWpcomTransaction(
	payload: WPCOMTransactionEndpointRequestPayload,
	transactionOptions: PaymentProcessorOptions
): Promise< WPCOMTransactionEndpointResponse > {
	const isJetpackUserLessCheckout =
		payload.cart.is_jetpack_checkout && payload.cart.cart_key === 'no-user';

	if ( transactionOptions.createUserAndSiteBeforeTransaction || isJetpackUserLessCheckout ) {
		const isJetpackUserLessCheckout = payload.cart.is_jetpack_checkout;

		const createAccountOptions = isJetpackUserLessCheckout
			? { signupFlowName: 'jetpack-userless-checkout' }
			: { signupFlowName: 'onboarding-registrationless' };

		return createAccount( createAccountOptions ).then( ( response ) => {
			const siteIdFromResponse = response?.blog_details?.blogid;

			// If the account is already created(as happens when we are reprocessing after a transaction error), then
			// the create account response will not have a site ID, so we fetch from state.
			const siteId = siteIdFromResponse || transactionOptions.siteId;
			const newPayload = {
				...payload,
				cart: {
					...payload.cart,
					blog_id: siteId || '0',
					cart_key: siteId || 'no-site',
				},
			};
			return wp.req.post(
				'/me/transactions',
				mapRecordKeysRecursively( newPayload, camelToSnakeCase )
			);
		} );
	}

	return wp.req.post( '/me/transactions', mapRecordKeysRecursively( payload, camelToSnakeCase ) );
}
