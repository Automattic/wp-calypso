import { makeRedirectResponse, makeErrorResponse } from '@automattic/composite-checkout';
import {
	mapRecordKeysRecursively,
	camelToSnakeCase,
	tryToGuessPostalCodeFormat,
} from '@automattic/wpcom-checkout';
import debugFactory from 'debug';
import wp from 'calypso/lib/wp';
import { recordTransactionBeginAnalytics } from '../lib/analytics';
import getDomainDetails from '../lib/get-domain-details';
import { createTransactionEndpointCartFromResponseCart } from '../lib/translate-cart';
import { createAccount } from '../payment-method-helpers';
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
	try {
		currentUrl = window.location.href;
		currentBaseUrl = window.location.origin;
	} catch ( error ) {
		currentUrl = `https://wordpress.com/checkout/${ siteSlug }`;
		currentBaseUrl = 'https://wordpress.com';
	}
	const currentUrlWithoutQuery = currentUrl.split( /\?|#/ )[ 0 ];
	const successUrl = thankYouUrl.startsWith( 'http' ) ? thankYouUrl : currentBaseUrl + thankYouUrl;
	const cancelUrl = createUserAndSiteBeforeTransaction
		? currentUrlWithoutQuery + '?cart=no-user'
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
		.then( makeRedirectResponse )
		.catch( ( error ) => makeErrorResponse( error.message ) );
}

async function wpcomPayPalExpress(
	payload: PayPalExpressEndpointRequestPayload,
	transactionOptions: PaymentProcessorOptions
) {
	const isJetpackUserLessCheckout =
		payload.cart.is_jetpack_checkout && payload.cart.cart_key === 'no-user';

	if ( transactionOptions.createUserAndSiteBeforeTransaction || isJetpackUserLessCheckout ) {
		const createAccountOptions = isJetpackUserLessCheckout
			? { signupFlowName: 'jetpack-userless-checkout' }
			: { signupFlowName: 'onboarding-registrationless' };

		return createAccount( createAccountOptions ).then( ( response ) => {
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
				},
			};

			return wp.req.post(
				'/me/paypal-express-url',
				mapRecordKeysRecursively( newPayload, camelToSnakeCase )
			);
		} );
	}

	return wp.req.post(
		'/me/paypal-express-url',
		mapRecordKeysRecursively( payload, camelToSnakeCase )
	);
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
