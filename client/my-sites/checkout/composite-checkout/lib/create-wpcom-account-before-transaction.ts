import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { createAccount } from '../payment-method-helpers';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type { WPCOMTransactionEndpointCart } from '@automattic/wpcom-checkout';

export async function createWpcomAccountBeforeTransaction(
	transactionCart: WPCOMTransactionEndpointCart,
	transactionOptions: PaymentProcessorOptions
): Promise< WPCOMTransactionEndpointCart > {
	const isJetpackUserLessCheckout = transactionCart.is_jetpack_checkout;

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
		return {
			...transactionCart,
			blog_id: siteId ? String( siteId ) : '0',
			cart_key: siteId ? String( siteId ) : 'no-site',
			create_new_blog: siteId ? false : true,
		};
	} );
}
