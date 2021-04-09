/**
 * External dependencies
 */
import debugFactory from 'debug';
import { makeRedirectResponse, makeErrorResponse } from '@automattic/composite-checkout';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';
import type { ResponseCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import { recordTransactionBeginAnalytics } from '../lib/analytics';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import getDomainDetails from '../lib/get-domain-details';
import type { PayPalExpressEndpointRequestPayload } from '../types/paypal-express';
import { createAccount } from '../payment-method-helpers';
import wp from 'calypso/lib/wp';
import type { DomainContactDetails } from '../types/backend/domain-contact-details-components';
import { createTransactionEndpointCartFromResponseCart } from '../lib/translate-cart';

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
		siteSlug,
	} = transactionOptions;
	recordTransactionBeginAnalytics( {
		reduxDispatch,
		paymentMethodId: 'paypal',
	} );

	const thankYouUrl = getThankYouUrl();
	let currentUrl;
	try {
		currentUrl = window.location.href;
	} catch ( error ) {
		currentUrl = `https://wordpress.com/checkout/${ siteSlug }`;
	}
	const currentUrlWithoutQuery = currentUrl.split( '?' )[ 0 ];
	const successUrl = thankYouUrl.startsWith( 'http' )
		? thankYouUrl
		: currentUrlWithoutQuery + thankYouUrl;
	const cancelUrl = createUserAndSiteBeforeTransaction
		? currentUrlWithoutQuery + '?cart=no-user'
		: currentUrlWithoutQuery;

	const formattedTransactionData = createPayPalExpressEndpointRequestPayloadFromLineItems( {
		responseCart,
		successUrl,
		cancelUrl,
		siteId,
		domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ) || null,
	} );
	debug( 'sending paypal transaction', formattedTransactionData );
	return wpcomPayPalExpress( formattedTransactionData, transactionOptions )
		.then( makeRedirectResponse )
		.catch( ( error ) => makeErrorResponse( error.message ) );
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
	domainDetails,
	responseCart,
}: {
	successUrl: string;
	cancelUrl: string;
	siteId: string | number | undefined;
	domainDetails: DomainContactDetails | null;
	responseCart: ResponseCart;
} ): PayPalExpressEndpointRequestPayload {
	return {
		successUrl,
		cancelUrl,
		cart: createTransactionEndpointCartFromResponseCart( {
			siteId: siteId ? String( siteId ) : undefined,
			contactDetails: domainDetails,
			responseCart,
		} ),
		country: responseCart.tax.location.country_code ?? '',
		postalCode: responseCart.tax.location.postal_code ?? '',
		domainDetails,
	};
}
