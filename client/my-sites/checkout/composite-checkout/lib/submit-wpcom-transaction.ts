import { mapRecordKeysRecursively, camelToSnakeCase } from '@automattic/js-utils';
import wp from 'calypso/lib/wp';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
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

		return createAccount( {
			signupFlowName: isJetpackUserLessCheckout
				? 'jetpack-userless-checkout'
				: 'onboarding-registrationless',
			email: transactionOptions.contactDetails?.email?.value,
			siteId: transactionOptions.siteId,
			recaptchaClientId: transactionOptions.recaptchaClientId,
		} ).then( ( response ) => {
			const siteIdFromResponse = response?.blog_details?.blogid;

			// We need to store the created site ID so that if the transaction fails,
			// we can retry safely. createUserAndSiteBeforeTransaction will still be
			// set and createAccount is idempotent for site site creation so long as
			// siteId is set (although it will update the email address if that
			// changes).
			if ( siteIdFromResponse ) {
				transactionOptions.reduxDispatch( setSelectedSiteId( Number( siteIdFromResponse ) ) );
			}

			// If the account is already created (as happens when we are reprocessing
			// after a transaction error), then the create account response will not
			// have a site ID, so we fetch from state.
			const siteId = siteIdFromResponse || transactionOptions.siteId;
			const newPayload = {
				...payload,
				cart: {
					...payload.cart,
					blog_id: siteId || '0',
					cart_key: siteId || 'no-site',
					create_new_blog: siteId ? false : true,
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
