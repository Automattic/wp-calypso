/**
 * External dependencies
 */
import type {
	WPCOMTransactionEndpointRequestPayload,
	WPCOMTransactionEndpointResponse,
} from '@automattic/wpcom-checkout';

/**
 * Internal dependencies
 */
import type { PaymentProcessorOptions } from '../types/payment-processors';
import { createAccount } from '../payment-method-helpers';
import wp from 'calypso/lib/wp';

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
			return wp.undocumented().transactions( newPayload );
		} );
	}

	return wp.undocumented().transactions( payload );
}
