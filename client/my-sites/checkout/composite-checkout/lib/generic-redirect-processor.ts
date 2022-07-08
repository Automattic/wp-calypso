import { makeRedirectResponse, makeErrorResponse } from '@automattic/composite-checkout';
import { addUrlToPendingPageRedirect } from '../lib/pending-page';
import prepareRedirectTransaction from '../lib/prepare-redirect-transaction';
import { recordTransactionBeginAnalytics } from './analytics';
import getDomainDetails from './get-domain-details';
import getPostalCode from './get-postal-code';
import submitWpcomTransaction from './submit-wpcom-transaction';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';
import type {
	WPCOMTransactionEndpointResponse,
	CheckoutPaymentMethodSlug,
} from '@automattic/wpcom-checkout';

type RedirectTransactionRequest = {
	name: string | undefined;
	email: string | undefined;
};

export default async function genericRedirectProcessor(
	paymentMethodId: CheckoutPaymentMethodSlug,
	submitData: unknown,
	transactionOptions: PaymentProcessorOptions
): Promise< PaymentProcessorResponse > {
	const {
		getThankYouUrl,
		siteSlug,
		siteId,
		includeDomainDetails,
		includeGSuiteDetails,
		reduxDispatch,
		responseCart,
		contactDetails,
	} = transactionOptions;
	if ( ! isValidTransactionData( submitData ) ) {
		throw new Error( 'Required purchase data is missing' );
	}

	// The success URL will be a pending page where we will poll for the order
	// until a webhook is received that confirms the payment, at which point the
	// pending page will redirect to the thank-you page as returned by
	// getThankYouUrl.
	const {
		origin = 'https://wordpress.com',
		pathname = '/',
		search = '',
	} = typeof window !== 'undefined' ? window.location : {};
	const thankYouUrl = getThankYouUrl() || 'https://wordpress.com';
	const successUrl = addUrlToPendingPageRedirect( thankYouUrl, siteSlug, undefined, 'absolute' );
	const cancelUrl = `${ origin }${ pathname }${ search }`;

	reduxDispatch( recordTransactionBeginAnalytics( { paymentMethodId } ) );

	const formattedTransactionData = prepareRedirectTransaction(
		paymentMethodId,
		{
			...submitData,
			name: submitData.name ?? '',
			successUrl,
			cancelUrl,
			couponId: responseCart.coupon,
			country: contactDetails?.countryCode?.value ?? '',
			postalCode: getPostalCode( contactDetails ),
			subdivisionCode: contactDetails?.state?.value,
			siteId: siteId ? String( siteId ) : '',
			domainDetails: getDomainDetails( contactDetails, {
				includeDomainDetails,
				includeGSuiteDetails,
			} ),
		},
		transactionOptions
	);

	return submitWpcomTransaction( formattedTransactionData, transactionOptions )
		.then( ( response?: WPCOMTransactionEndpointResponse ) => {
			if ( ! response?.redirect_url ) {
				throw new Error( 'Error during transaction' );
			}
			return makeRedirectResponse( response?.redirect_url );
		} )
		.catch( ( error ) => makeErrorResponse( error.message ) );
}

function isValidTransactionData( submitData: unknown ): submitData is RedirectTransactionRequest {
	const data = submitData as RedirectTransactionRequest;
	if ( ! data ) {
		throw new Error( 'Transaction requires data and none was provided' );
	}
	return true;
}
