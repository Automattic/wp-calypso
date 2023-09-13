import {
	makeRedirectResponse,
	makeManualResponse,
	makeErrorResponse,
} from '@automattic/composite-checkout';
import userAgent from 'calypso/lib/user-agent';
import { recordTransactionBeginAnalytics } from '../lib/analytics';
import getDomainDetails from '../lib/get-domain-details';
import getPostalCode from '../lib/get-postal-code';
import prepareRedirectTransaction from '../lib/prepare-redirect-transaction';
import submitWpcomTransaction from './submit-wpcom-transaction';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';
import type { WPCOMTransactionEndpointResponse } from '@automattic/wpcom-checkout';

type WeChatTransactionRequest = {
	name: string | undefined;
	email: string | undefined;
};

export default async function weChatProcessor(
	submitData: unknown,
	options: PaymentProcessorOptions
): Promise< PaymentProcessorResponse > {
	if ( ! isValidTransactionData( submitData ) ) {
		throw new Error( 'Required purchase data is missing' );
	}

	const {
		getThankYouUrl,
		siteSlug,
		siteId,
		includeDomainDetails,
		includeGSuiteDetails,
		reduxDispatch,
		responseCart,
		contactDetails,
	} = options;
	const paymentMethodId = 'wechat';

	reduxDispatch( recordTransactionBeginAnalytics( { paymentMethodId } ) );

	const baseURL = new URL(
		typeof window !== 'undefined' ? window.location.href : 'https://wordpress.com'
	);

	const redirectToSuccessUrl = new URL( baseURL );
	redirectToSuccessUrl.pathname = getThankYouUrl();

	const successUrl = new URL( baseURL );
	successUrl.pathname = `/checkout/thank-you/${ siteSlug || 'no-site' }/pending`;
	successUrl.searchParams.set( 'redirectTo', redirectToSuccessUrl.toString() );

	// Clear all query params from the base URL:
	const cancelUrl = new URL( baseURL );
	cancelUrl.search = '';

	const formattedTransactionData = prepareRedirectTransaction(
		paymentMethodId,
		{
			...submitData,
			name: submitData.name ?? '',
			successUrl: successUrl.toString(),
			cancelUrl: cancelUrl.toString(),
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
		options
	);

	return submitWpcomTransaction( formattedTransactionData, options )
		.then( ( response?: WPCOMTransactionEndpointResponse ) => {
			// The WeChat payment type should only redirect when on mobile as redirect urls
			// are mobile app urls: e.g. weixin://wxpay/bizpayurl?pr=RaXzhu4
			if ( userAgent.isMobile && response?.redirect_url ) {
				return makeRedirectResponse( response?.redirect_url );
			}
			return makeManualResponse( response );
		} )
		.catch( ( error ) => makeErrorResponse( error.message ) );
}

function isValidTransactionData( submitData: unknown ): submitData is WeChatTransactionRequest {
	const data = submitData as WeChatTransactionRequest;
	if ( ! data ) {
		throw new Error( 'Transaction requires data and none was provided' );
	}
	return true;
}
