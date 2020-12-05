/**
 * External dependencies
 */
import {
	defaultRegistry,
	makeSuccessResponse,
	makeRedirectResponse,
	makeManualResponse,
} from '@automattic/composite-checkout';
import { format as formatUrl, parse as parseUrl, resolve as resolveUrl } from 'url'; // eslint-disable-line no-restricted-imports
import { confirmStripePaymentIntent } from '@automattic/calypso-stripe';

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
	submitPayPalExpressRequest,
} from './payment-method-helpers';
import { createEbanxToken } from 'calypso/lib/store-transactions';
import userAgent from 'calypso/lib/user-agent';

const { select } = defaultRegistry;

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
	).then( ( response ) => {
		return makeRedirectResponse( response?.redirect_url );
	} );
}

export async function weChatProcessor(
	submitData,
	{ getThankYouUrl, siteSlug, includeDomainDetails, includeGSuiteDetails }
) {
	const paymentMethodId = 'wechat';
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
	).then( ( response ) => {
		// The WeChat payment type should only redirect when on mobile as redirect urls
		// are mobile app urls: e.g. weixin://wxpay/bizpayurl?pr=RaXzhu4
		if ( userAgent.isMobile ) {
			return makeRedirectResponse( response?.redirect_url );
		}
		return makeManualResponse( response );
	} );
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
	).then( makeSuccessResponse );
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
		.then( ( stripeResponse ) => {
			if ( stripeResponse?.message?.payment_intent_client_secret ) {
				// 3DS authentication required
				onEvent( { type: 'SHOW_MODAL_AUTHORIZATION' } );
				return confirmStripePaymentIntent(
					submitData.stripeConfiguration,
					stripeResponse?.message?.payment_intent_client_secret
				);
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
	).then( makeSuccessResponse );
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
	).then( makeSuccessResponse );
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
			country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
			postalCode: submitData.postalCode || getPostalCode(),
			subdivisionCode: select( 'wpcom' )?.getContactInfo?.()?.state?.value,
		},
		wpcomTransaction,
		transactionOptions
	).then( makeSuccessResponse );
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
	).then( makeRedirectResponse );
}
