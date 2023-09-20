import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { createAccount } from '../payment-method-helpers';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type { RequestCart, CartKey } from '@automattic/shopping-cart';

export async function createWpcomAccountBeforeTransaction(
	transactionCart: RequestCart,
	transactionOptions: PaymentProcessorOptions
): Promise< RequestCart > {
	const isJetpackUserLessCheckout = transactionCart.products.some(
		( product ) => product.extra.isJetpackCheckout
	);
	const isAkismetUserLessCheckout = transactionCart.products.some(
		( product ) => product.extra.isAkismetSitelessCheckout
	);
	const isGiftingCheckout = transactionCart.products.some(
		( product ) => product.extra.isGiftPurchase
	);

	const signupFlowName = ( () => {
		if ( isJetpackUserLessCheckout ) {
			return 'jetpack-userless-checkout';
		}
		if ( isAkismetUserLessCheckout ) {
			return 'akismet-userless-checkout';
		}
		if ( isGiftingCheckout ) {
			return 'gifting-userless-checkout';
		}

		return 'onboarding-registrationless';
	} )();

	/*
	 * We treat Gifting as jetpack-userless-checkout to create and verify the user
	 * on success checkout.
	 */
	return createAccount( {
		signupFlowName,
		email: transactionOptions.contactDetails?.email?.value,
		siteId: transactionOptions.siteId,
		recaptchaClientId: transactionOptions.recaptchaClientId,
	} ).then( ( response ) => {
		const siteIdFromResponse: number | undefined = parseInt(
			response?.blog_details?.blogid ?? '0'
		);

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
		const siteId: number | undefined = siteIdFromResponse || transactionOptions.siteId || 0;
		return {
			...transactionCart,
			blog_id: siteId,
			cart_key: ( siteId ? siteId : 'no-site' ) as CartKey,
		};
	} );
}
