/**
 * External dependencies
 */
import { defaultRegistry } from '@automattic/composite-checkout';
import { format as formatUrl, parse as parseUrl } from 'url';

/**
 * Internal dependencies
 */
import {
	getDomainDetails,
	wpcomTransaction,
	wpcomPayPalExpress,
	submitApplePayPayment,
	submitStripeCardTransaction,
	submitFreePurchaseTransaction,
	submitCreditsTransaction,
	submitExistingCardPayment,
	submitPayPalExpressRequest,
} from './payment-method-helpers';
import { createStripePaymentMethod } from 'lib/stripe';

const { select, dispatch } = defaultRegistry;

export function applePayProcessor( submitData, createNewSiteData ) {
	const pending = submitApplePayPayment(
		{
			...submitData,
			createNewSiteData,
			siteId: select( 'wpcom' )?.getSiteId?.(),
			domainDetails: getDomainDetails( select ),
			country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
			postalCode: select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value,
		},
		wpcomTransaction
	);
	// save result so we can get receipt_id and failed_purchases in getThankYouPageUrl
	pending.then( ( result ) => {
		// TODO: do this automatically when calling setTransactionComplete
		dispatch( 'wpcom' ).setTransactionResponse( result );
	} );
	return pending;
}

export async function stripeCardProcessor( submitData, createNewSiteData ) {
	const paymentMethodToken = await createStripePaymentMethodToken( {
		...submitData,
		country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
		postalCode: select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value,
	} );
	const pending = submitStripeCardTransaction(
		{
			...submitData,
			createNewSiteData,
			country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
			postalCode: select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value,
			subdivisionCode: select( 'wpcom' )?.getContactInfo?.()?.state?.value,
			siteId: select( 'wpcom' )?.getSiteId?.(),
			domainDetails: getDomainDetails( select ),
			paymentMethodToken,
		},
		wpcomTransaction
	);
	// save result so we can get receipt_id and failed_purchases in getThankYouPageUrl
	pending.then( ( result ) => {
		// TODO: do this automatically when calling setTransactionComplete
		dispatch( 'wpcom' ).setTransactionResponse( result );
	} );
	return pending;
}

export async function existingCardProcessor( submitData, createNewSiteData ) {
	const pending = submitExistingCardPayment(
		{
			...submitData,
			createNewSiteData,
			country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
			postalCode: select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value,
			subdivisionCode: select( 'wpcom' )?.getContactInfo?.()?.state?.value,
			siteId: select( 'wpcom' )?.getSiteId?.(),
			domainDetails: getDomainDetails( select ),
		},
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

export async function freePurchaseProcessor( submitData, createNewSiteData ) {
	const pending = submitFreePurchaseTransaction(
		{
			...submitData,
			createNewSiteData,
			siteId: select( 'wpcom' )?.getSiteId?.(),
			domainDetails: getDomainDetails( select ),
			// this data is intentionally empty so we do not charge taxes
			country: null,
			postalCode: null,
		},
		wpcomTransaction
	);
	// save result so we can get receipt_id and failed_purchases in getThankYouPageUrl
	pending.then( ( result ) => {
		dispatch( 'wpcom' ).setTransactionResponse( result );
	} );
	return pending;
}

export async function fullCreditsProcessor( submitData, createNewSiteData ) {
	const pending = submitCreditsTransaction(
		{
			...submitData,
			createNewSiteData,
			siteId: select( 'wpcom' )?.getSiteId?.(),
			domainDetails: getDomainDetails( select ),
			// this data is intentionally empty so we do not charge taxes
			country: null,
			postalCode: null,
		},
		wpcomTransaction
	);
	// save result so we can get receipt_id and failed_purchases in getThankYouPageUrl
	pending.then( ( result ) => {
		// TODO: do this automatically when calling setTransactionComplete
		dispatch( 'wpcom' ).setTransactionResponse( result );
	} );
	return pending;
}

export async function payPalProcessor( submitData, getThankYouUrl, couponItem, createNewSiteData ) {
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
		{
			...submitData,
			createNewSiteData,
			successUrl,
			cancelUrl,
			siteId: select( 'wpcom' )?.getSiteId?.() ?? '',
			domainDetails: getDomainDetails( select ),
			couponId: couponItem?.wpcom_meta?.couponCode,
			country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value ?? '',
			postalCode: select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value ?? '',
			subdivisionCode: select( 'wpcom' )?.getContactInfo?.()?.state?.value ?? '',
		},
		wpcomPayPalExpress
	);
	// save result so we can get receipt_id and failed_purchases in getThankYouPageUrl
	pending.then( ( result ) => {
		// TODO: do this automatically when calling setTransactionComplete
		dispatch( 'wpcom' ).setTransactionResponse( result );
	} );
	return pending;
}
