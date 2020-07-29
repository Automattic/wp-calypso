/**
 * External dependencies
 */
import { defaultRegistry } from '@automattic/composite-checkout';
import { format as formatUrl, parse as parseUrl } from 'url'; // eslint-disable-line no-restricted-imports

/**
 * Internal dependencies
 */
import {
	addDomainDetailsToSubmitData,
	wpcomTransaction,
	wpcomPayPalExpress,
	submitApplePayPayment,
	submitStripeCardTransaction,
	submitStripeRedirectTransaction,
	submitFreePurchaseTransaction,
	submitCreditsTransaction,
	submitExistingCardPayment,
	submitPayPalExpressRequest,
} from './payment-method-helpers';
import { createStripePaymentMethod } from 'lib/stripe';

const { select, dispatch } = defaultRegistry;

export function genericRedirectProcessor( paymentMethodId, submitData, getThankYouUrl, siteSlug ) {
	const { protocol, hostname, port, pathname } = parseUrl(
		typeof window !== 'undefined' ? window.location.href : 'https://wordpress.com',
		true
	);
	const cancelUrlQuery = {};
	const redirectToSuccessUrl = formatUrl( {
		protocol,
		hostname,
		port,
		pathname: getThankYouUrl(),
	} );
	const successUrl = formatUrl( {
		protocol,
		hostname,
		port,
		pathname: `/checkout/thank-you/${ siteSlug || 'no-site' }/pending`,
		query: { redirectTo: redirectToSuccessUrl },
	} );
	const cancelUrl = formatUrl( {
		protocol,
		hostname,
		port,
		pathname,
		query: cancelUrlQuery,
	} );
	const pending = submitStripeRedirectTransaction(
		paymentMethodId,
		addDomainDetailsToSubmitData(
			{
				...submitData,
				successUrl,
				cancelUrl,
				country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
				postalCode: select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value,
				subdivisionCode: select( 'wpcom' )?.getContactInfo?.()?.state?.value,
				siteId: select( 'wpcom' )?.getSiteId?.(),
			},
			select
		),
		wpcomTransaction
	);
	// save result so we can get receipt_id and failed_purchases in getThankYouPageUrl
	pending.then( ( result ) => {
		// TODO: do this automatically when calling setTransactionComplete
		dispatch( 'wpcom' ).setTransactionResponse( result );
	} );
	return pending;
}

export function applePayProcessor( submitData ) {
	const pending = submitApplePayPayment(
		addDomainDetailsToSubmitData(
			{
				...submitData,
				siteId: select( 'wpcom' )?.getSiteId?.(),
				country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
				postalCode: select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value,
			},
			select
		),
		wpcomTransaction
	);
	// save result so we can get receipt_id and failed_purchases in getThankYouPageUrl
	pending.then( ( result ) => {
		// TODO: do this automatically when calling setTransactionComplete
		dispatch( 'wpcom' ).setTransactionResponse( result );
	} );
	return pending;
}

export async function stripeCardProcessor( submitData ) {
	const paymentMethodToken = await createStripePaymentMethodToken( {
		...submitData,
		country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
		postalCode: select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value,
	} );
	const pending = submitStripeCardTransaction(
		addDomainDetailsToSubmitData(
			{
				...submitData,
				country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
				postalCode: select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value,
				subdivisionCode: select( 'wpcom' )?.getContactInfo?.()?.state?.value,
				siteId: select( 'wpcom' )?.getSiteId?.(),
				paymentMethodToken,
			},
			select
		),
		wpcomTransaction
	);
	// save result so we can get receipt_id and failed_purchases in getThankYouPageUrl
	pending.then( ( result ) => {
		// TODO: do this automatically when calling setTransactionComplete
		dispatch( 'wpcom' ).setTransactionResponse( result );
	} );
	return pending;
}

export async function existingCardProcessor( submitData ) {
	const pending = submitExistingCardPayment(
		addDomainDetailsToSubmitData(
			{
				...submitData,
				country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
				postalCode: select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value,
				subdivisionCode: select( 'wpcom' )?.getContactInfo?.()?.state?.value,
				siteId: select( 'wpcom' )?.getSiteId?.(),
			},
			select
		),
		wpcomTransaction
	);
	// save result so we can get receipt_id and failed_purchases in getThankYouPageUrl
	pending.then( ( result ) => {
		// TODO: do this automatically when calling setTransactionComplete
		dispatch( 'wpcom' ).setTransactionResponse( result );
	} );
	return pending;
}

function createStripePaymentMethodToken( { stripe, name, country, postalCode } ) {
	return createStripePaymentMethod( stripe, {
		name,
		address: {
			country,
			postal_code: postalCode,
		},
	} );
}

export async function freePurchaseProcessor( submitData ) {
	const pending = submitFreePurchaseTransaction(
		addDomainDetailsToSubmitData(
			{
				...submitData,
				siteId: select( 'wpcom' )?.getSiteId?.(),
				// this data is intentionally empty so we do not charge taxes
				country: null,
				postalCode: null,
			},
			select
		),
		wpcomTransaction
	);
	// save result so we can get receipt_id and failed_purchases in getThankYouPageUrl
	pending.then( ( result ) => {
		dispatch( 'wpcom' ).setTransactionResponse( result );
	} );
	return pending;
}

export async function fullCreditsProcessor( submitData ) {
	const pending = submitCreditsTransaction(
		addDomainDetailsToSubmitData(
			{
				...submitData,
				siteId: select( 'wpcom' )?.getSiteId?.(),
				// this data is intentionally empty so we do not charge taxes
				country: null,
				postalCode: null,
			},
			select
		),
		wpcomTransaction
	);
	// save result so we can get receipt_id and failed_purchases in getThankYouPageUrl
	pending.then( ( result ) => {
		// TODO: do this automatically when calling setTransactionComplete
		dispatch( 'wpcom' ).setTransactionResponse( result );
	} );
	return pending;
}

export async function payPalProcessor( submitData, getThankYouUrl, couponItem ) {
	const { protocol, hostname, port, pathname } = parseUrl( window.location.href, true );
	const successUrl = formatUrl( {
		protocol,
		hostname,
		port,
		pathname: getThankYouUrl(),
	} );
	const cancelUrl = formatUrl( {
		protocol,
		hostname,
		port,
		pathname,
	} );

	const pending = submitPayPalExpressRequest(
		addDomainDetailsToSubmitData(
			{
				...submitData,
				successUrl,
				cancelUrl,
				siteId: select( 'wpcom' )?.getSiteId?.() ?? '',
				couponId: couponItem?.wpcom_meta?.couponCode,
				country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value ?? '',
				postalCode: select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value ?? '',
				subdivisionCode: select( 'wpcom' )?.getContactInfo?.()?.state?.value ?? '',
			},
			select
		),
		wpcomPayPalExpress
	);
	// save result so we can get receipt_id and failed_purchases in getThankYouPageUrl
	pending.then( ( result ) => {
		// TODO: do this automatically when calling setTransactionComplete
		dispatch( 'wpcom' ).setTransactionResponse( result );
	} );
	return pending;
}
