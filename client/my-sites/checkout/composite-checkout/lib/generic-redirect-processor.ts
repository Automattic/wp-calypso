/**
 * External dependencies
 */
import { format as formatUrl, parse as parseUrl } from 'url'; // eslint-disable-line no-restricted-imports
import { defaultRegistry, makeRedirectResponse } from '@automattic/composite-checkout';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import getPostalCode from './get-postal-code';
import getDomainDetails from './get-domain-details';
import { recordTransactionBeginAnalytics } from './analytics';
import submitWpcomTransaction from './submit-wpcom-transaction';
import prepareRedirectTransaction from '../lib/prepare-redirect-transaction';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type { WPCOMTransactionEndpointResponse } from '../types/transaction-endpoint';
import type { CheckoutPaymentMethodSlug } from '../types/checkout-payment-method-slug';
import type { ManagedContactDetails } from '../types/wpcom-store-state';

const { select } = defaultRegistry;

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
	} = transactionOptions;
	if ( ! isValidTransactionData( submitData ) ) {
		throw new Error( 'Required purchase data is missing' );
	}

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

	recordTransactionBeginAnalytics( {
		paymentMethodId,
		reduxDispatch,
	} );

	const managedContactDetails: ManagedContactDetails | undefined = select(
		'wpcom'
	)?.getContactInfo();

	const formattedTransactionData = prepareRedirectTransaction(
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
			siteId: siteId ? String( siteId ) : '',
			domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ),
		},
		transactionOptions
	);

	return submitWpcomTransaction( formattedTransactionData, transactionOptions ).then(
		( response?: WPCOMTransactionEndpointResponse ) => {
			if ( ! response?.redirect_url ) {
				throw new Error( 'Error during transaction' );
			}
			return makeRedirectResponse( response?.redirect_url );
		}
	);
}

function isValidTransactionData( submitData: unknown ): submitData is RedirectTransactionRequest {
	const data = submitData as RedirectTransactionRequest;
	if ( ! data ) {
		throw new Error( 'Transaction requires data and none was provided' );
	}
	return true;
}
