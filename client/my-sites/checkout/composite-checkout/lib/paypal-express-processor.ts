import { makeRedirectResponse, makeErrorResponse } from '@automattic/composite-checkout';
import { mapRecordKeysRecursively, camelToSnakeCase } from '@automattic/js-utils';
import { tryToGuessPostalCodeFormat } from '@automattic/wpcom-checkout';
import debugFactory from 'debug';
import wp from 'calypso/lib/wp';
import { recordTransactionBeginAnalytics } from '../lib/analytics';
import getDomainDetails from '../lib/get-domain-details';
import { createTransactionEndpointCartFromResponseCart } from '../lib/translate-cart';
import { createWpcomAccountBeforeTransaction } from './create-wpcom-account-before-transaction';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';
import type { ResponseCart, DomainContactDetails } from '@automattic/shopping-cart';
import type { PayPalExpressEndpointRequestPayload } from '@automattic/wpcom-checkout';

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
		contactDetails,
	} = transactionOptions;
	reduxDispatch( recordTransactionBeginAnalytics( { paymentMethodId: 'paypal' } ) );

	const thankYouUrl = getThankYouUrl();
	let currentUrl;
	let currentBaseUrl;
	let currentUrlQuery;
	try {
		currentUrl = window.location.href;
		currentBaseUrl = window.location.origin;
		currentUrlQuery = window.location.search;
	} catch ( error ) {
		currentUrl = `https://wordpress.com/checkout/${ siteSlug }`;
		currentBaseUrl = 'https://wordpress.com';
		currentUrlQuery = '';
	}
	const currentUrlWithoutQuery = currentUrl.split( /\?|#/ )[ 0 ];
	const updatedQuery = new URLSearchParams( currentUrlQuery );
	const successUrl = thankYouUrl.startsWith( 'http' ) ? thankYouUrl : currentBaseUrl + thankYouUrl;
	if ( createUserAndSiteBeforeTransaction ) {
		updatedQuery.append( 'cart', 'no-user' );
	}
	const updatedQueryString = updatedQuery.toString();
	const cancelUrl = updatedQueryString.length
		? currentUrlWithoutQuery + '?' + updatedQueryString
		: currentUrlWithoutQuery;

	const formattedTransactionData = createPayPalExpressEndpointRequestPayloadFromLineItems( {
		responseCart,
		successUrl,
		cancelUrl,
		siteId,
		domainDetails:
			getDomainDetails( contactDetails, { includeDomainDetails, includeGSuiteDetails } ) || null,
	} );
	debug( 'sending paypal transaction', formattedTransactionData );
	return wpcomPayPalExpress( formattedTransactionData, transactionOptions )
		.then( ( response ) => {
			if ( ! response?.redirect_url ) {
				throw new Error( 'There was an error redirecting to PayPal' );
			}
			return makeRedirectResponse( response.redirect_url );
		} )
		.catch( ( error ) => makeErrorResponse( error.message ) );
}

/**
 * Submit a transaction to the WPCOM PayPal transactions endpoint.
 *
 * This is one of two transactions endpoint functions; also see
 * `submitWpcomTransaction`.
 *
 * Note that the payload property is (mostly) in camelCase but the actual
 * submitted data will be converted (mostly) to snake_case.
 *
 * Please do not alter payload inside this function if possible to retain type
 * safety. Instead, alter
 * `createPayPalExpressEndpointRequestPayloadFromLineItems` or add a new type
 * safe function that works similarly (see
 * `createWpcomAccountBeforeTransaction`).
 */
async function wpcomPayPalExpress(
	payload: PayPalExpressEndpointRequestPayload,
	transactionOptions: PaymentProcessorOptions
) {
	const isJetpackUserLessCheckout =
		payload.cart.is_jetpack_checkout && payload.cart.cart_key === 'no-user';

	if ( transactionOptions.createUserAndSiteBeforeTransaction || isJetpackUserLessCheckout ) {
		payload.cart = await createWpcomAccountBeforeTransaction( payload.cart, transactionOptions );
	}

	const body = mapRecordKeysRecursively( payload, camelToSnakeCase );
	const path = '/me/paypal-express-url';
	const apiVersion = '1.2';
	return wp.req.post( { path }, { apiVersion }, body );
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
	const postalCode = responseCart.tax.location.postal_code ?? '';
	const country = responseCart.tax.location.country_code ?? '';
	return {
		successUrl,
		cancelUrl,
		cart: createTransactionEndpointCartFromResponseCart( {
			siteId: siteId ? String( siteId ) : undefined,
			contactDetails: domainDetails,
			responseCart,
		} ),
		country,
		postalCode: postalCode ? tryToGuessPostalCodeFormat( postalCode.toUpperCase(), country ) : '',
		domainDetails,
	};
}
