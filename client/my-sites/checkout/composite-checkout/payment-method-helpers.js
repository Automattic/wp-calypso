/**
 * External dependencies
 */
import React from 'react';
import debugFactory from 'debug';
import styled from '@emotion/styled';
import i18n, { useTranslate } from 'i18n-calypso';
import { defaultRegistry } from '@automattic/composite-checkout';
import { createStripePaymentMethod } from '@automattic/calypso-stripe';

/**
 * Internal dependencies
 */
import wp from 'calypso/lib/wp';
import { createTransactionEndpointRequestPayloadFromLineItems } from './types/transaction-endpoint';
import { createPayPalExpressEndpointRequestPayloadFromLineItems } from './types/paypal-express';
import { translateCheckoutPaymentMethodToWpcomPaymentMethod } from 'calypso/my-sites/checkout/composite-checkout/types/backend/payment-method';
import { prepareDomainContactDetailsForTransaction } from 'calypso/my-sites/checkout/composite-checkout/types/wpcom-store-state';
import { tryToGuessPostalCodeFormat } from 'calypso/lib/postal-code';
import { getSavedVariations } from 'calypso/lib/abtest';
import { stringifyBody } from 'calypso/state/login/utils';
import { recordGoogleRecaptchaAction } from 'calypso/lib/analytics/recaptcha';

const debug = debugFactory( 'calypso:composite-checkout:payment-method-helpers' );
const { select } = defaultRegistry;

export async function submitExistingCardPayment( transactionData, submit, transactionOptions ) {
	debug( 'formatting existing card transaction', transactionData );
	const formattedTransactionData = createTransactionEndpointRequestPayloadFromLineItems( {
		...transactionData,
		paymentMethodType: 'WPCOM_Billing_MoneyPress_Stored',
	} );
	debug( 'submitting existing card transaction', formattedTransactionData );
	return submit( formattedTransactionData, transactionOptions );
}

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

export function getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ) {
	const managedContactDetails = select( 'wpcom' )?.getContactInfo?.() ?? {};
	const domainDetails = prepareDomainContactDetailsForTransaction( managedContactDetails );
	return includeDomainDetails || includeGSuiteDetails ? domainDetails : null;
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

export function WordPressFreePurchaseLabel() {
	const translate = useTranslate();

	return (
		<React.Fragment>
			<div>{ translate( 'Free Purchase' ) }</div>
			<WordPressLogo />
		</React.Fragment>
	);
}

export function WordPressFreePurchaseSummary() {
	const translate = useTranslate();
	return <div>{ translate( 'Free Purchase' ) }</div>;
}

export function WordPressCreditsLabel( { credits } ) {
	const translate = useTranslate();

	return (
		<React.Fragment>
			<div>
				{ translate( 'WordPress.com Credits: %(amount)s available', {
					args: { amount: credits.wpcom_meta.credits_display },
					comment: "The total value of credits on the user's account",
				} ) }
			</div>
			<WordPressLogo />
		</React.Fragment>
	);
}

export function WordPressCreditsSummary() {
	const translate = useTranslate();
	return <div>{ translate( 'WordPress.com Credits' ) }</div>;
}

function WordPressLogo() {
	return (
		<PayMentMethodLogos className="composite-checkout__wordpress-logo payment-logos">
			<svg
				width="21"
				height="21"
				viewBox="0 0 21 21"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M10.2598 0.461304C4.74757 0.461304 0.259766 4.94911 0.259766 10.4613C0.259766 15.9735 4.74757 20.4613 10.2598 20.4613C15.772 20.4613 20.2598 15.9735 20.2598 10.4613C20.2598 4.94911 15.772 0.461304 10.2598 0.461304ZM1.27196 10.4613C1.27196 9.15643 1.55245 7.92472 2.05245 6.80277L6.33294 18.5467C3.33294 17.0955 1.27196 14.0223 1.27196 10.4613ZM10.2598 19.4491C9.38172 19.4491 8.52806 19.315 7.72318 19.0833L10.4183 11.2418L13.1866 18.815C13.1988 18.8637 13.2232 18.9003 13.2476 18.9369C12.3085 19.2662 11.3085 19.4491 10.2598 19.4491ZM11.4915 6.24179C12.0281 6.2174 12.5159 6.15643 12.5159 6.15643C13.0037 6.09545 12.9427 5.38813 12.4549 5.41252C12.4549 5.41252 11.0037 5.52228 10.0524 5.52228C9.1744 5.52228 7.6866 5.41252 7.6866 5.41252C7.19879 5.38813 7.15001 6.11984 7.62562 6.15643C7.62562 6.15643 8.08903 6.2174 8.56464 6.24179L9.96708 10.0833L8.02806 15.9857L4.74757 6.24179C5.28416 6.2174 5.77196 6.15643 5.77196 6.15643C6.25977 6.09545 6.19879 5.38813 5.71099 5.41252C5.71099 5.41252 4.25977 5.52228 3.32074 5.52228C3.15001 5.52228 2.95489 5.52228 2.74757 5.51008C4.35733 3.07106 7.11342 1.4613 10.2598 1.4613C12.6012 1.4613 14.7354 2.35155 16.3329 3.82716C16.2964 3.82716 16.2598 3.81496 16.211 3.81496C15.3329 3.81496 14.6988 4.58326 14.6988 5.41252C14.6988 6.15643 15.1256 6.77838 15.5768 7.52228C15.9183 8.11984 16.3207 8.88813 16.3207 9.99789C16.3207 10.7662 16.089 11.7418 15.6378 12.9003L14.7354 15.9003L11.4915 6.24179ZM14.772 18.2296L17.5159 10.2906C18.0281 9.01009 18.1988 7.98569 18.1988 7.07106C18.1988 6.74179 18.1744 6.43691 18.1378 6.14423C18.8451 7.42472 19.2354 8.88813 19.2354 10.4613C19.2476 13.7784 17.4549 16.6686 14.772 18.2296Z"
					fill="#006088"
				/>
			</svg>
		</PayMentMethodLogos>
	);
}

const PayMentMethodLogos = styled.span`
	height: 16px;
`;

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
