import { makeRedirectResponse, makeErrorResponse } from '@automattic/composite-checkout';
import {
	mapRecordKeysRecursively,
	camelToSnakeCase,
	tryToGuessPostalCodeFormat,
} from '@automattic/wpcom-checkout';
import debugFactory from 'debug';
import wp from 'calypso/lib/wp';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
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
		.then( ( response ) => {
			if ( ! response?.redirect_url ) {
				throw new Error( 'There was an error redirecting to PayPal' );
			}
			return makeRedirectResponse( response.redirect_url );
		} )
		.catch( ( error ) => makeErrorResponse( error.message ) );
}

async function wpcomPayPalExpress(
	payload: PayPalExpressEndpointRequestPayload,
	transactionOptions: PaymentProcessorOptions
) {
	const path = '/me/paypal-express-url';
	const apiVersion = '1.2';

	const isJetpackUserLessCheckout =
		payload.cart.is_jetpack_checkout && payload.cart.cart_key === 'no-user';

	if ( transactionOptions.createUserAndSiteBeforeTransaction || isJetpackUserLessCheckout ) {
		return createAccount( {
			signupFlowName: isJetpackUserLessCheckout
				? 'jetpack-userless-checkout'
				: 'onboarding-registrationless',
			email: transactionOptions.contactDetails?.email?.value,
			siteId: transactionOptions.siteId,
			recaptchaClientId: transactionOptions.recaptchaClientId,
		} ).then( ( response ) => {
			const siteIdFromResponse = response?.blog_details?.blogid;

			// We need to store the created site ID so that if the transaction fails,
			// we can retry safely. createUserAndSiteBeforeTransaction will still be
			// set and createAccount is idempotent for site site creation so long as
			// siteId is set (although it will update the email address if that
			// changes).
			if ( siteIdFromResponse ) {
				transactionOptions.reduxDispatch( setSelectedSiteId( Number( siteIdFromResponse ) ) );
			}

			// If the account is already created (as happens when we are reprocessing
			// after a transaction error), then the create account response will not
			// have a site ID, so we fetch from state.
			const siteId = siteIdFromResponse || transactionOptions.siteId;
			const newPayload = {
				...payload,
				siteId,
				cart: {
					...payload.cart,
					blog_id: siteId || '0',
					cart_key: siteId || 'no-site',
					create_new_blog: siteId ? false : true,
				},
			};

			const body = mapRecordKeysRecursively( newPayload, camelToSnakeCase );
			return wp.req.post( { path }, { apiVersion }, body );
		} );
	}

	const body = mapRecordKeysRecursively( payload, camelToSnakeCase );
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
