/**
 * External dependencies
 */
import debugFactory from 'debug';
import { defaultRegistry, makeRedirectResponse } from '@automattic/composite-checkout';
import { format as formatUrl, parse as parseUrl, resolve as resolveUrl } from 'url'; // eslint-disable-line no-restricted-imports
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';
import type { ResponseCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import { recordTransactionBeginAnalytics } from '../lib/analytics';
import getPostalCode from '../lib/get-postal-code';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type { ManagedContactDetails } from '../types/wpcom-store-state';
import getDomainDetails from '../lib/get-domain-details';
import type { PayPalExpressEndpointRequestPayload } from '../types/paypal-express';
import { createAccount } from '../payment-method-helpers';
import wp from 'calypso/lib/wp';
import type { DomainContactDetails } from '../types/backend/domain-contact-details-components';
import { createTransactionEndpointCartFromResponseCart } from '../lib/translate-cart';

const { select } = defaultRegistry;
const debug = debugFactory( 'calypso:composite-checkout:paypal-express-processor' );

export default async function payPalProcessor(
	transactionOptions: PaymentProcessorOptions
): Promise< PaymentProcessorResponse > {
	const {
		getThankYouUrl,
		createUserAndSiteBeforeTransaction,
		reduxDispatch,
		includeDomainDetails,
		includeGSuiteDetails,
		responseCart,
		siteId,
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
		responseCart,
		successUrl,
		cancelUrl,
		siteId,
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

async function wpcomPayPalExpress(
	payload: PayPalExpressEndpointRequestPayload,
	transactionOptions: PaymentProcessorOptions
) {
	if ( transactionOptions && transactionOptions.createUserAndSiteBeforeTransaction ) {
		return createAccount().then( ( response ) => {
			const siteIdFromResponse = response?.blog_details?.blogid;

			// If the account is already created(as happens when we are reprocessing after a transaction error), then
			// the create account response will not have a site ID, so we fetch from state.
			const siteId = siteIdFromResponse || transactionOptions.siteId;
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

function createPayPalExpressEndpointRequestPayloadFromLineItems( {
	successUrl,
	cancelUrl,
	siteId,
	couponId,
	country,
	postalCode,
	subdivisionCode,
	domainDetails,
	responseCart,
}: {
	successUrl: string;
	cancelUrl: string;
	siteId: string | number | undefined;
	couponId: string;
	country: string;
	postalCode: string;
	subdivisionCode: string;
	domainDetails: DomainContactDetails | null;
	responseCart: ResponseCart;
} ): PayPalExpressEndpointRequestPayload {
	return {
		successUrl,
		cancelUrl,
		cart: createTransactionEndpointCartFromResponseCart( {
			siteId: siteId ? String( siteId ) : undefined,
			couponId,
			country,
			postalCode,
			subdivisionCode,
			contactDetails: domainDetails,
			responseCart,
		} ),
		country,
		postalCode,
		domainDetails,
	};
}
