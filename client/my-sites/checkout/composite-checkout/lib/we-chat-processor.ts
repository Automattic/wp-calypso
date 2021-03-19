/**
 * External dependencies
 */
import {
	defaultRegistry,
	makeRedirectResponse,
	makeManualResponse,
} from '@automattic/composite-checkout';
import { format as formatUrl, parse as parseUrl } from 'url'; // eslint-disable-line no-restricted-imports
import type { LineItem, PaymentProcessorResponse } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import userAgent from 'calypso/lib/user-agent';
import getPostalCode from '../lib/get-postal-code';
import getDomainDetails from '../lib/get-domain-details';
import { recordTransactionBeginAnalytics } from '../lib/analytics';
import submitRedirectTransaction from '../lib/submit-redirect-transaction';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type { WPCOMCartItem } from '../types/checkout-cart';
import type { ManagedContactDetails } from '../types/wpcom-store-state';
import type { WPCOMTransactionEndpointResponse } from '../types/transaction-endpoint';

const { select } = defaultRegistry;

type WeChatTransactionRequest = {
	name: string | undefined;
	email: string | undefined;
	items: WPCOMCartItem[];
	total: LineItem;
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
		includeDomainDetails,
		includeGSuiteDetails,
		reduxDispatch,
		responseCart,
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

	const managedContactDetails: ManagedContactDetails | undefined = select(
		'wpcom'
	)?.getContactInfo();

	return submitRedirectTransaction(
		paymentMethodId,
		{
			...submitData,
			name: submitData.name ?? '',
			successUrl,
			cancelUrl,
			couponId: responseCart.coupon,
			country: managedContactDetails?.countryCode?.value ?? '',
			postalCode: getPostalCode(),
			subdivisionCode: managedContactDetails?.state?.value,
			siteId: select( 'wpcom' )?.getSiteId?.(),
			domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ),
		},
		options
	).then( ( response?: WPCOMTransactionEndpointResponse ) => {
		// The WeChat payment type should only redirect when on mobile as redirect urls
		// are mobile app urls: e.g. weixin://wxpay/bizpayurl?pr=RaXzhu4
		if ( userAgent.isMobile && response?.redirect_url ) {
			return makeRedirectResponse( response?.redirect_url );
		}
		return makeManualResponse( response );
	} );
}

function isValidTransactionData( submitData: unknown ): submitData is WeChatTransactionRequest {
	const data = submitData as WeChatTransactionRequest;
	if ( ! ( data?.items?.length > 0 ) ) {
		throw new Error( 'Transaction requires items and none were provided' );
	}
	// Validate data required for this payment method type. Some other data may
	// be required by the server but not required here since the server will give
	// a better localized error message than we can provide.
	if ( ! data.total ) {
		throw new Error( 'Transaction requires total and none was provided' );
	}
	return true;
}
