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
import { translateCheckoutPaymentMethodToWpcomPaymentMethod } from './lib/translate-payment-method-names';
import { getSavedVariations } from 'calypso/lib/abtest';
import { stringifyBody } from 'calypso/state/login/utils';
import { recordGoogleRecaptchaAction } from 'calypso/lib/analytics/recaptcha';
import { createTransactionEndpointRequestPayloadFromLineItems } from './lib/translate-cart';

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

export async function createAccount() {
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

export function createStripePaymentMethodToken( { stripe, name, country, postalCode } ) {
	return createStripePaymentMethod( stripe, {
		name,
		address: {
			country,
			postal_code: postalCode,
		},
	} );
}
