/**
 * External dependencies
 */
import debugFactory from 'debug';
import { defaultRegistry, makeRedirectResponse } from '@automattic/composite-checkout';
import { format as formatUrl, parse as parseUrl, resolve as resolveUrl } from 'url'; // eslint-disable-line no-restricted-imports
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import { recordTransactionBeginAnalytics } from '../lib/analytics';
import getPostalCode from '../lib/get-postal-code';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type { WPCOMCartItem } from '../types/checkout-cart';
import type { ManagedContactDetails } from '../types/wpcom-store-state';
import getDomainDetails from '../lib/get-domain-details';
import { createPayPalExpressEndpointRequestPayloadFromLineItems } from '../types/paypal-express'; // FIXME: move from types
import type { PayPalExpressEndpointRequestPayload } from '../types/paypal-express';
import { createAccount } from '../payment-method-helpers';
import wp from 'calypso/lib/wp';

const { select } = defaultRegistry;
const debug = debugFactory( 'calypso:composite-checkout:paypal-express-processor' );

type PayPalPaymentMethodData = {
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

	const formattedTransactionData = createPayPalExpressEndpointRequestPayloadFromLineItems( {
		...transactionData,
		successUrl,
		cancelUrl,
		siteId: select( 'wpcom' )?.getSiteId?.() ?? '',
		couponId: responseCart.coupon,
		country: managedContactDetails?.countryCode?.value ?? '',
		postalCode: getPostalCode(),
		subdivisionCode: managedContactDetails?.state?.value ?? '',
		domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ) || null,
	} );
	debug( 'sending paypal transaction', formattedTransactionData );
	return wpcomPayPalExpress( formattedTransactionData, transactionOptions ).then(
		makeRedirectResponse
	);
}

function isValidTransactionData( submitData: unknown ): submitData is PayPalPaymentMethodData {
	const data = submitData as PayPalPaymentMethodData;
	if ( ! ( data?.items?.length > 0 ) ) {
		throw new Error( 'Transaction requires items and none were provided' );
	}
	return true;
}

async function wpcomPayPalExpress(
	payload: PayPalExpressEndpointRequestPayload,
	transactionOptions: PaymentProcessorOptions
) {
	if ( transactionOptions && transactionOptions.createUserAndSiteBeforeTransaction ) {
		return createAccount().then( ( response ) => {
			const siteIdFromResponse = response?.blog_details?.blogid;

			// If the account is already created(as happens when we are reprocessing after a transaction error), then
			// the create account response will not have a site ID, so we fetch from state.
			const siteId = siteIdFromResponse || select( 'wpcom' )?.getSiteId();
			const newPayload = {
				...payload,
				siteId,
				cart: {
					...payload.cart,
					blog_id: siteId || '0',
					cart_key: siteId || 'no-site',
					create_new_blog: false,
				},
			};

			return wp.undocumented().paypalExpressUrl( newPayload );
		} );
	}

	return wp.undocumented().paypalExpressUrl( payload );
}
