/**
 * External dependencies
 */
import { defaultRegistry } from '@automattic/composite-checkout';
import { format as formatUrl, parse as parseUrl } from 'url'; // eslint-disable-line no-restricted-imports

/**
 * Internal dependencies
 */
import {
	getDomainDetails,
	createStripePaymentMethodToken,
	wpcomTransaction,
	wpcomPayPalExpress,
	submitApplePayPayment,
	submitStripeCardTransaction,
	submitEbanxCardTransaction,
	submitStripeRedirectTransaction,
	submitFreePurchaseTransaction,
	submitCreditsTransaction,
	submitExistingCardPayment,
	submitPayPalExpressRequest,
} from './payment-method-helpers';
import { createEbanxToken } from 'lib/store-transactions';

const { select, dispatch } = defaultRegistry;

export function genericRedirectProcessor(
	paymentMethodId,
	submitData,
	{ getThankYouUrl, siteSlug, includeDomainDetails, includeGSuiteDetails }
) {
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
		{
			...submitData,
			successUrl,
			cancelUrl,
			country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
			postalCode: select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value,
			subdivisionCode: select( 'wpcom' )?.getContactInfo?.()?.state?.value,
			siteId: select( 'wpcom' )?.getSiteId?.(),
			domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ),
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

export function applePayProcessor( submitData, { includeDomainDetails, includeGSuiteDetails } ) {
	const pending = submitApplePayPayment(
		{
			...submitData,
			siteId: select( 'wpcom' )?.getSiteId?.(),
			country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
			postalCode: select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value,
			domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ),
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

export async function stripeCardProcessor(
	submitData,
	{ includeDomainDetails, includeGSuiteDetails }
) {
	const paymentMethodToken = await createStripePaymentMethodToken( {
		...submitData,
		country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
		postalCode: select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value,
	} );
	const pending = submitStripeCardTransaction(
		{
			...submitData,
			country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
			postalCode: select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value,
			subdivisionCode: select( 'wpcom' )?.getContactInfo?.()?.state?.value,
			siteId: select( 'wpcom' )?.getSiteId?.(),
			domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ),
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

export async function ebanxCardProcessor(
	submitData,
	{ includeDomainDetails, includeGSuiteDetails }
) {
	const paymentMethodToken = await createEbanxToken( 'new_purchase', {
		country: submitData.countryCode,
		name: submitData.name,
		number: submitData.number,
		cvv: submitData.cvv,
		'expiration-date': submitData[ 'expiration-date' ],
	} );
	const pending = submitEbanxCardTransaction(
		{
			...submitData,
			siteId: select( 'wpcom' )?.getSiteId?.(),
			deviceId: paymentMethodToken?.deviceId,
			domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ),
			paymentMethodToken,
		},
		wpcomTransaction
	);
	pending.then( ( result ) => {
		// TODO: do this automatically when calling setTransactionComplete
		dispatch( 'wpcom' ).setTransactionResponse( result );
	} );
	return pending;
}

export async function multiPartnerCardProcessor(
	submitData,
	{ includeDomainDetails, includeGSuiteDetails }
) {
	const paymentPartner = submitData.paymentPartner;

	if ( paymentPartner === 'stripe' ) {
		return stripeCardProcessor( submitData, { includeDomainDetails, includeGSuiteDetails } );
	}

	if ( paymentPartner === 'ebanx' ) {
		return ebanxCardProcessor( submitData, { includeDomainDetails, includeGSuiteDetails } );
	}

	throw new RangeError( 'Unrecognized card payment partner: "' + paymentPartner + '"' );
}

export async function existingCardProcessor(
	submitData,
	{ includeDomainDetails, includeGSuiteDetails }
) {
	const pending = submitExistingCardPayment(
		{
			...submitData,
			country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
			postalCode: select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value,
			subdivisionCode: select( 'wpcom' )?.getContactInfo?.()?.state?.value,
			siteId: select( 'wpcom' )?.getSiteId?.(),
			domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ),
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

export async function freePurchaseProcessor(
	submitData,
	{ includeDomainDetails, includeGSuiteDetails }
) {
	const pending = submitFreePurchaseTransaction(
		{
			...submitData,
			siteId: select( 'wpcom' )?.getSiteId?.(),
			domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ),
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

export async function fullCreditsProcessor(
	submitData,
	{ includeDomainDetails, includeGSuiteDetails }
) {
	const pending = submitCreditsTransaction(
		{
			...submitData,
			siteId: select( 'wpcom' )?.getSiteId?.(),
			domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ),
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

export async function payPalProcessor(
	submitData,
	{ getThankYouUrl, couponItem, includeDomainDetails, includeGSuiteDetails }
) {
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
			successUrl,
			cancelUrl,
			siteId: select( 'wpcom' )?.getSiteId?.() ?? '',
			couponId: couponItem?.wpcom_meta?.couponCode,
			country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value ?? '',
			postalCode: select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value ?? '',
			subdivisionCode: select( 'wpcom' )?.getContactInfo?.()?.state?.value ?? '',
			domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ),
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
