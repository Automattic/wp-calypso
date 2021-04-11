/**
 * External dependencies
 */
import {
	makeRedirectResponse,
	makeManualResponse,
	makeErrorResponse,
} from '@automattic/composite-checkout';
import { format as formatUrl, parse as parseUrl } from 'url'; // eslint-disable-line no-restricted-imports
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import userAgent from 'calypso/lib/user-agent';
import getPostalCode from '../lib/get-postal-code';
import getDomainDetails from '../lib/get-domain-details';
import { recordTransactionBeginAnalytics } from '../lib/analytics';
import prepareRedirectTransaction from '../lib/prepare-redirect-transaction';
import submitWpcomTransaction from './submit-wpcom-transaction';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type { WPCOMTransactionEndpointResponse } from '../types/transaction-endpoint';

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
	recordTransactionBeginAnalytics( {
		reduxDispatch,
		paymentMethodId,
	} );
	const { protocol, hostname, port, pathname } = parseUrl(
		typeof window !== 'undefined' ? window.location.href : 'https://wordpress.com',
		true
	);
	const cancelUrlQuery = {};
	const redirectToSuccessUrl = formatUrl( {
		protocol,
		hostname,
		port,
		pathname: getThankYouUrl(),
	} );
	const successUrl = formatUrl( {
		protocol,
		hostname,
		port,
		pathname: `/checkout/thank-you/${ siteSlug || 'no-site' }/pending`,
		query: { redirectTo: redirectToSuccessUrl },
	} );
	const cancelUrl = formatUrl( {
		protocol,
		hostname,
		port,
		pathname,
		query: cancelUrlQuery,
	} );

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
			domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ),
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
