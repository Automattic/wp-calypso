/**
 * External dependencies
 */
import { defaultRegistry, makeRedirectResponse } from '@automattic/composite-checkout';
import { format as formatUrl, parse as parseUrl, resolve as resolveUrl } from 'url'; // eslint-disable-line no-restricted-imports
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import { wpcomPayPalExpress, submitPayPalExpressRequest } from '../payment-method-helpers';
import { recordTransactionBeginAnalytics } from '../lib/analytics';
import getPostalCode from '../lib/get-postal-code';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type { WPCOMCartItem } from '../types/checkout-cart';
import type { ManagedContactDetails } from '../types/wpcom-store-state';
import getDomainDetails from '../lib/get-domain-details';

const { select } = defaultRegistry;

type PayPalTransactionRequest = {
	items: WPCOMCartItem[];
};

export default async function payPalProcessor(
	transactionData: unknown,
	transactionOptions: PaymentProcessorOptions
): Promise< PaymentProcessorResponse > {
	if ( ! isValidTransactionData( transactionData ) ) {
		throw new Error( 'Required purchase data is missing' );
	}

	const {
		getThankYouUrl,
		createUserAndSiteBeforeTransaction,
		reduxDispatch,
		includeDomainDetails,
		includeGSuiteDetails,
		responseCart,
	} = transactionOptions;
	recordTransactionBeginAnalytics( {
		reduxDispatch,
		paymentMethodId: 'paypal',
	} );

	const { protocol, hostname, port, pathname } = parseUrl( window.location.href, true );

	const successUrl = resolveUrl( window.location.href, getThankYouUrl() );

	const cancelUrl = formatUrl( {
		protocol,
		hostname,
		port,
		pathname,
		query: createUserAndSiteBeforeTransaction ? { cart: 'no-user' } : {},
	} );

	const managedContactDetails: ManagedContactDetails | undefined = select(
		'wpcom'
	)?.getContactInfo();

	return submitPayPalExpressRequest(
		{
			...transactionData,
			successUrl,
			cancelUrl,
			siteId: select( 'wpcom' )?.getSiteId?.() ?? '',
			couponId: responseCart.coupon,
			country: managedContactDetails?.countryCode?.value ?? '',
			postalCode: getPostalCode(),
			subdivisionCode: managedContactDetails?.state?.value ?? '',
			domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ),
		},
		wpcomPayPalExpress,
		transactionOptions
	).then( makeRedirectResponse );
}

function isValidTransactionData( submitData: unknown ): submitData is PayPalTransactionRequest {
	const data = submitData as PayPalTransactionRequest;
	if ( ! ( data?.items?.length > 0 ) ) {
		throw new Error( 'Transaction requires items and none were provided' );
	}
	return true;
}
