/**
 * External dependencies
 */
import {
	defaultRegistry,
	makeSuccessResponse,
	makeRedirectResponse,
} from '@automattic/composite-checkout';
import { format as formatUrl, parse as parseUrl, resolve as resolveUrl } from 'url'; // eslint-disable-line no-restricted-imports

/**
 * Internal dependencies
 */
import {
	getPostalCode,
	getDomainDetails,
	createStripePaymentMethodToken,
	wpcomTransaction,
	wpcomPayPalExpress,
	submitApplePayPayment,
	submitStripeCardTransaction,
	submitEbanxCardTransaction,
	submitRedirectTransaction,
	submitFreePurchaseTransaction,
	submitCreditsTransaction,
	submitExistingCardPayment,
	submitPayPalExpressRequest,
} from './payment-method-helpers';
import { createEbanxToken } from 'calypso/lib/store-transactions';
import { showStripeModalAuth } from 'calypso/lib/stripe';

const { select, dispatch } = defaultRegistry;

export async function genericRedirectProcessor(
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
	return submitRedirectTransaction(
		paymentMethodId,
		{
			...submitData,
			successUrl,
			cancelUrl,
			country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
			postalCode: submitData.postalCode || getPostalCode(),
			subdivisionCode: select( 'wpcom' )?.getContactInfo?.()?.state?.value,
			siteId: select( 'wpcom' )?.getSiteId?.(),
			domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ),
		},
		wpcomTransaction
	).then( saveTransactionResponseToWpcomStore );
}

export async function applePayProcessor(
	submitData,
	{ includeDomainDetails, includeGSuiteDetails },
	transactionOptions
) {
	return submitApplePayPayment(
		{
			...submitData,
			siteId: select( 'wpcom' )?.getSiteId?.(),
			country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
			domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ),
			postalCode: getPostalCode(),
		},
		wpcomTransaction,
		transactionOptions
	).then( saveTransactionResponseToWpcomStore );
}

export async function stripeCardProcessor(
	submitData,
	{ includeDomainDetails, includeGSuiteDetails, recordEvent: onEvent },
	transactionOptions
) {
	const paymentMethodToken = await createStripePaymentMethodToken( {
		...submitData,
		country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
		postalCode: getPostalCode(),
	} );
	return submitStripeCardTransaction(
		{
			...submitData,
			country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
			postalCode: getPostalCode(),
			subdivisionCode: select( 'wpcom' )?.getContactInfo?.()?.state?.value,
			siteId: select( 'wpcom' )?.getSiteId?.(),
			domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ),
			paymentMethodToken,
		},
		wpcomTransaction,
		transactionOptions
	)
		.then( saveTransactionResponseToWpcomStore )
		.then( ( stripeResponse ) => {
			if ( stripeResponse?.message?.payment_intent_client_secret ) {
				// 3DS authentication required
				onEvent( { type: 'SHOW_MODAL_AUTHORIZATION' } );
				return showStripeModalAuth( {
					stripeConfiguration: submitData.stripeConfiguration,
					response: stripeResponse,
				} );
			}
			return stripeResponse;
		} )
		.then( ( stripeResponse ) => {
			if ( stripeResponse?.redirect_url ) {
				return makeRedirectResponse( stripeResponse.redirect_url );
			}
			return makeSuccessResponse( stripeResponse );
		} );
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
	return submitEbanxCardTransaction(
		{
			...submitData,
			siteId: select( 'wpcom' )?.getSiteId?.(),
			deviceId: paymentMethodToken?.deviceId,
			domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ),
			paymentMethodToken,
		},
		wpcomTransaction
	)
		.then( saveTransactionResponseToWpcomStore )
		.then( ( response ) => {
			return makeSuccessResponse( response );
		} );
}

export async function multiPartnerCardProcessor(
	submitData,
	{ includeDomainDetails, includeGSuiteDetails, recordEvent },
	transactionOptions
) {
	const paymentPartner = submitData.paymentPartner;
	if ( paymentPartner === 'stripe' ) {
		return stripeCardProcessor(
			submitData,
			{ includeDomainDetails, includeGSuiteDetails, recordEvent },
			transactionOptions
		);
	}
	if ( paymentPartner === 'ebanx' ) {
		return ebanxCardProcessor( submitData, {
			includeDomainDetails,
			includeGSuiteDetails,
			recordEvent,
		} );
	}
	throw new RangeError( 'Unrecognized card payment partner: "' + paymentPartner + '"' );
}

export async function existingCardProcessor(
	submitData,
	{ includeDomainDetails, includeGSuiteDetails, recordEvent },
	transactionOptions
) {
	return submitExistingCardPayment(
		{
			...submitData,
			country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
			postalCode: getPostalCode(),
			subdivisionCode: select( 'wpcom' )?.getContactInfo?.()?.state?.value,
			siteId: select( 'wpcom' )?.getSiteId?.(),
			domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ),
		},
		wpcomTransaction,
		transactionOptions
	)
		.then( saveTransactionResponseToWpcomStore )
		.then( ( stripeResponse ) => {
			if ( stripeResponse?.message?.payment_intent_client_secret ) {
				// 3DS authentication required
				recordEvent( { type: 'SHOW_MODAL_AUTHORIZATION' } );
				return showStripeModalAuth( {
					stripeConfiguration: submitData.stripeConfiguration,
					response: stripeResponse,
				} );
			}
			return stripeResponse;
		} )
		.then( ( stripeResponse ) => {
			if ( stripeResponse?.redirect_url ) {
				return makeRedirectResponse( stripeResponse.redirect_url );
			}
			return makeSuccessResponse( stripeResponse );
		} );
}

export async function freePurchaseProcessor(
	submitData,
	{ includeDomainDetails, includeGSuiteDetails }
) {
	return submitFreePurchaseTransaction(
		{
			...submitData,
			siteId: select( 'wpcom' )?.getSiteId?.(),
			domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ),
			// this data is intentionally empty so we do not charge taxes
			country: null,
			postalCode: null,
		},
		wpcomTransaction
	).then( saveTransactionResponseToWpcomStore );
}

export async function fullCreditsProcessor(
	submitData,
	{ includeDomainDetails, includeGSuiteDetails },
	transactionOptions
) {
	return submitCreditsTransaction(
		{
			...submitData,
			siteId: select( 'wpcom' )?.getSiteId?.(),
			domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ),
			// this data is intentionally empty so we do not charge taxes
			country: null,
			postalCode: null,
		},
		wpcomTransaction,
		transactionOptions
	).then( saveTransactionResponseToWpcomStore );
}

export async function payPalProcessor(
	submitData,
	{ getThankYouUrl, couponItem, includeDomainDetails, includeGSuiteDetails },
	transactionOptions
) {
	const { createUserAndSiteBeforeTransaction } = transactionOptions;
	const { protocol, hostname, port, pathname } = parseUrl( window.location.href, true );

	const successUrl = resolveUrl( window.location.href, getThankYouUrl() );

	const cancelUrl = formatUrl( {
		protocol,
		hostname,
		port,
		pathname,
		query: createUserAndSiteBeforeTransaction ? { cart: 'no-user' } : {},
	} );

	return submitPayPalExpressRequest(
		{
			...submitData,
			successUrl,
			cancelUrl,
			siteId: select( 'wpcom' )?.getSiteId?.() ?? '',
			couponId: couponItem?.wpcom_meta?.couponCode,
			country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value ?? '',
			postalCode: getPostalCode(),
			subdivisionCode: select( 'wpcom' )?.getContactInfo?.()?.state?.value ?? '',
			domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ),
		},
		wpcomPayPalExpress,
		transactionOptions
	).then( saveTransactionResponseToWpcomStore );
}

async function saveTransactionResponseToWpcomStore( result ) {
	// save result so we can get receipt_id and failed_purchases in getThankYouPageUrl
	dispatch( 'wpcom' ).setTransactionResponse( result );
	return result;
}
