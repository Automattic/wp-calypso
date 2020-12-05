/**
 * External dependencies
 */
import debugFactory from 'debug';
import i18n from 'i18n-calypso';
import { defaultRegistry } from '@automattic/composite-checkout';
import { createStripePaymentMethod } from '@automattic/calypso-stripe';

/**
 * Internal dependencies
 */
import wp from 'calypso/lib/wp';
import { createTransactionEndpointRequestPayloadFromLineItems } from './types/transaction-endpoint';
import { createPayPalExpressEndpointRequestPayloadFromLineItems } from './types/paypal-express';
import { translateCheckoutPaymentMethodToWpcomPaymentMethod } from './lib/translate-payment-method-names';
import { tryToGuessPostalCodeFormat } from 'calypso/lib/postal-code';
import { getSavedVariations } from 'calypso/lib/abtest';
import { stringifyBody } from 'calypso/state/login/utils';
import { recordGoogleRecaptchaAction } from 'calypso/lib/analytics/recaptcha';

const debug = debugFactory( 'calypso:composite-checkout:payment-method-helpers' );
const { select } = defaultRegistry;

export async function submitApplePayPayment( transactionData, submit, transactionOptions ) {
	debug( 'formatting apple-pay transaction', transactionData );
	const formattedTransactionData = createTransactionEndpointRequestPayloadFromLineItems( {
		...transactionData,
		paymentMethodType: 'WPCOM_Billing_Stripe_Payment_Method',
		paymentPartnerProcessorId: transactionData.stripeConfiguration.processor_id,
	} );
	debug( 'submitting apple-pay transaction', formattedTransactionData );
	return submit( formattedTransactionData, transactionOptions );
}

export async function submitPayPalExpressRequest( transactionData, submit, transactionOptions ) {
	const formattedTransactionData = createPayPalExpressEndpointRequestPayloadFromLineItems( {
		...transactionData,
	} );
	debug( 'sending paypal transaction', formattedTransactionData );
	return submit( formattedTransactionData, transactionOptions );
}

export async function fetchStripeConfiguration( requestArgs, wpcom ) {
	return wpcom.stripeConfiguration( requestArgs );
}

export async function submitStripeCardTransaction( transactionData, submit, transactionOptions ) {
	const formattedTransactionData = createTransactionEndpointRequestPayloadFromLineItems( {
		...transactionData,
		paymentMethodToken: transactionData.paymentMethodToken.id,
		paymentMethodType: 'WPCOM_Billing_Stripe_Payment_Method',
		paymentPartnerProcessorId: transactionData.stripeConfiguration.processor_id,
	} );
	debug( 'sending stripe transaction', formattedTransactionData );
	return submit( formattedTransactionData, transactionOptions );
}

export async function submitEbanxCardTransaction( transactionData, submit ) {
	const formattedTransactionData = createTransactionEndpointRequestPayloadFromLineItems( {
		...transactionData,
		paymentMethodToken: transactionData.paymentMethodToken.token,
		paymentMethodType: 'WPCOM_Billing_Ebanx',
	} );
	debug( 'sending ebanx transaction', formattedTransactionData );
	return submit( formattedTransactionData );
}

export async function submitRedirectTransaction( paymentMethodId, transactionData, submit ) {
	const paymentMethodType = translateCheckoutPaymentMethodToWpcomPaymentMethod( paymentMethodId );
	if ( ! paymentMethodType ) {
		throw new Error( `No payment method found for type: ${ paymentMethodId }` );
	}
	const formattedTransactionData = createTransactionEndpointRequestPayloadFromLineItems( {
		...transactionData,
		paymentMethodType,
		paymentPartnerProcessorId: transactionData.stripeConfiguration?.processor_id,
	} );
	debug( `sending redirect transaction for type: ${ paymentMethodId }`, formattedTransactionData );
	return submit( formattedTransactionData );
}

export function submitCreditsTransaction( transactionData, submit, transactionOptions ) {
	debug( 'formatting full credits transaction', transactionData );
	const formattedTransactionData = createTransactionEndpointRequestPayloadFromLineItems( {
		...transactionData,
		paymentMethodType: 'WPCOM_Billing_WPCOM',
	} );
	debug( 'submitting full credits transaction', formattedTransactionData );
	return submit( formattedTransactionData, transactionOptions );
}

export function submitFreePurchaseTransaction( transactionData, submit ) {
	debug( 'formatting free transaction', transactionData );
	const formattedTransactionData = createTransactionEndpointRequestPayloadFromLineItems( {
		...transactionData,
		paymentMethodType: 'WPCOM_Billing_WPCOM',
	} );
	debug( 'submitting free transaction', formattedTransactionData );
	return submit( formattedTransactionData );
}

async function createAccountCallback( response ) {
	// Set siteId from response
	const siteIdFromResponse = response?.blog_details?.blogid;
	const siteSlugFromResponse = response?.blog_details?.site_slug;
	const { dispatch } = defaultRegistry;
	siteIdFromResponse && dispatch( 'wpcom' ).setSiteId( siteIdFromResponse );
	siteSlugFromResponse && dispatch( 'wpcom' ).setSiteSlug( siteSlugFromResponse );

	if ( ! response.bearer_token ) {
		return;
	}

	// Log in the user
	wp.loadToken( response.bearer_token );
	const url = 'https://wordpress.com/wp-login.php';
	const bodyObj = {
		authorization: 'Bearer ' + response.bearer_token,
		log: response.username,
	};

	return await globalThis.fetch( url, {
		method: 'POST',
		redirect: 'manual',
		credentials: 'include',
		headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
		body: stringifyBody( bodyObj ),
	} );
}

async function createAccount() {
	let newSiteParams = null;
	try {
		newSiteParams = JSON.parse( window.localStorage.getItem( 'siteParams' ) || '{}' );
	} catch ( err ) {
		newSiteParams = {};
	}

	const { email } = select( 'wpcom' )?.getContactInfo() ?? {};
	const siteId = select( 'wpcom' )?.getSiteId();
	const emailValue = email.value;
	const recaptchaClientId = select( 'wpcom' )?.getRecaptchaClientId();
	const isRecaptchaLoaded = typeof recaptchaClientId === 'number';

	let recaptchaToken = undefined;
	let recaptchaError = undefined;

	if ( isRecaptchaLoaded ) {
		recaptchaToken = await recordGoogleRecaptchaAction(
			recaptchaClientId,
			'calypso/signup/formSubmit'
		);

		if ( ! recaptchaToken ) {
			recaptchaError = 'recaptcha_failed';
		}
	} else {
		recaptchaError = 'recaptcha_didnt_load';
	}

	const blogName = newSiteParams?.blog_name;

	try {
		const response = await wp.undocumented().createUserAndSite(
			{
				email: emailValue,
				'g-recaptcha-error': recaptchaError,
				'g-recaptcha-response': recaptchaToken || undefined,
				is_passwordless: true,
				extra: { username_hint: blogName },
				signup_flow_name: 'onboarding-registrationless',
				validate: false,
				ab_test_variations: getSavedVariations(),
				new_site_params: newSiteParams,
				should_create_site: ! siteId,
			},
			null
		);

		createAccountCallback( response );
		return response;
	} catch ( error ) {
		const errorMessage = error?.message ? getErrorMessage( error ) : error;
		throw new Error( errorMessage );
	}
}

function getErrorMessage( { error, message } ) {
	switch ( error ) {
		case 'already_taken':
		case 'already_active':
		case 'email_exists':
			return i18n.translate( 'An account with this email address already exists.' );
		default:
			return message;
	}
}

export async function wpcomTransaction( payload, transactionOptions ) {
	if ( transactionOptions && transactionOptions.createUserAndSiteBeforeTransaction ) {
		return createAccount().then( ( response ) => {
			const siteIdFromResponse = response?.blog_details?.blogid;

			// If the account is already created(as happens when we are reprocessing after a transaction error), then
			// the create account response will not have a site ID, so we fetch from state.
			const siteId = siteIdFromResponse || select( 'wpcom' )?.getSiteId();
			const newPayload = {
				...payload,
				cart: {
					...payload.cart,
					blog_id: siteId || '0',
					cart_key: siteId || 'no-site',
					create_new_blog: false,
				},
			};

			return wp.undocumented().transactions( newPayload );
		} );
	}

	return wp.undocumented().transactions( payload );
}

export async function wpcomPayPalExpress( payload, transactionOptions ) {
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

export function createStripePaymentMethodToken( { stripe, name, country, postalCode } ) {
	return createStripePaymentMethod( stripe, {
		name,
		address: {
			country,
			postal_code: postalCode,
		},
	} );
}

export function getPostalCode() {
	const countryCode = select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value ?? '';
	const postalCode = select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value ?? '';
	return tryToGuessPostalCodeFormat( postalCode.toUpperCase(), countryCode );
}
