/**
 * External dependencies
 */
import {
	defaultRegistry,
	makeSuccessResponse,
	makeRedirectResponse,
	makeManualResponse,
} from '@automattic/composite-checkout';
import { format as formatUrl, parse as parseUrl } from 'url'; // eslint-disable-line no-restricted-imports
import { confirmStripePaymentIntent } from '@automattic/calypso-stripe';

/**
 * Internal dependencies
 */
import {
	createStripePaymentMethodToken,
	submitApplePayPayment,
	submitStripeCardTransaction,
	submitEbanxCardTransaction,
	submitFreePurchaseTransaction,
	submitCreditsTransaction,
} from './payment-method-helpers';
import getPostalCode from './lib/get-postal-code';
import getDomainDetails from './lib/get-domain-details';
import { createEbanxToken } from 'calypso/lib/store-transactions';
import userAgent from 'calypso/lib/user-agent';
import { recordTransactionBeginAnalytics } from './lib/analytics';
import submitWpcomTransaction from './lib/submit-wpcom-transaction';
import submitRedirectTransaction from './lib/submit-redirect-transaction';

const { select } = defaultRegistry;

export async function genericRedirectProcessor( paymentMethodId, submitData, options ) {
	const {
		getThankYouUrl,
		siteSlug,
		includeDomainDetails,
		includeGSuiteDetails,
		reduxDispatch,
		responseCart,
	} = options;
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

	recordTransactionBeginAnalytics( {
		paymentMethodId,
		reduxDispatch,
	} );

	return submitRedirectTransaction(
		paymentMethodId,
		{
			...submitData,
			successUrl,
			cancelUrl,
			couponId: responseCart.coupon,
			country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
			postalCode: submitData.postalCode || getPostalCode(),
			subdivisionCode: select( 'wpcom' )?.getContactInfo?.()?.state?.value,
			siteId: select( 'wpcom' )?.getSiteId?.(),
			domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ),
		},
		options
	).then( ( response ) => {
		return makeRedirectResponse( response?.redirect_url );
	} );
}

export async function weChatProcessor( submitData, options ) {
	const {
		getThankYouUrl,
		siteSlug,
		includeDomainDetails,
		includeGSuiteDetails,
		reduxDispatch,
		responseCart,
	} = options;
	const paymentMethodId = 'wechat';
	recordTransactionBeginAnalytics( {
		reduxDispatch,
		paymentMethodId,
	} );
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
			couponId: responseCart.coupon,
			country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
			postalCode: submitData.postalCode || getPostalCode(),
			subdivisionCode: select( 'wpcom' )?.getContactInfo?.()?.state?.value,
			siteId: select( 'wpcom' )?.getSiteId?.(),
			domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ),
		},
		options
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
	{ includeDomainDetails, includeGSuiteDetails, responseCart },
	transactionOptions
) {
	return submitApplePayPayment(
		{
			...submitData,
			couponId: responseCart.coupon,
			siteId: select( 'wpcom' )?.getSiteId?.(),
			country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
			domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ),
			postalCode: getPostalCode(),
		},
		submitWpcomTransaction,
		transactionOptions
	).then( makeSuccessResponse );
}

export async function stripeCardProcessor(
	submitData,
	{ includeDomainDetails, includeGSuiteDetails, recordEvent: onEvent, responseCart },
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
			couponId: responseCart.coupon,
			country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
			postalCode: getPostalCode(),
			subdivisionCode: select( 'wpcom' )?.getContactInfo?.()?.state?.value,
			siteId: select( 'wpcom' )?.getSiteId?.(),
			domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ),
			paymentMethodToken,
		},
		submitWpcomTransaction,
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
	{ includeDomainDetails, includeGSuiteDetails, responseCart }
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
			couponId: responseCart.coupon,
			siteId: select( 'wpcom' )?.getSiteId?.(),
			deviceId: paymentMethodToken?.deviceId,
			domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ),
			paymentMethodToken,
		},
		submitWpcomTransaction
	).then( makeSuccessResponse );
}

export async function multiPartnerCardProcessor(
	submitData,
	dataForProcessor,
	transactionOptions
) {
	const paymentPartner = submitData.paymentPartner;
	if ( paymentPartner === 'stripe' ) {
		return stripeCardProcessor( submitData, dataForProcessor, transactionOptions );
	}
	if ( paymentPartner === 'ebanx' ) {
		return ebanxCardProcessor( submitData, dataForProcessor );
	}
	throw new RangeError( 'Unrecognized card payment partner: "' + paymentPartner + '"' );
}

export async function freePurchaseProcessor(
	submitData,
	{ includeDomainDetails, includeGSuiteDetails, responseCart }
) {
	return submitFreePurchaseTransaction(
		{
			...submitData,
			couponId: responseCart.coupon,
			siteId: select( 'wpcom' )?.getSiteId?.(),
			domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ),
			// this data is intentionally empty so we do not charge taxes
			country: null,
			postalCode: null,
		},
		submitWpcomTransaction
	).then( makeSuccessResponse );
}

export async function fullCreditsProcessor(
	submitData,
	{ includeDomainDetails, includeGSuiteDetails, responseCart },
	transactionOptions
) {
	return submitCreditsTransaction(
		{
			...submitData,
			couponId: responseCart.coupon,
			siteId: select( 'wpcom' )?.getSiteId?.(),
			domainDetails: getDomainDetails( { includeDomainDetails, includeGSuiteDetails } ),
			country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
			postalCode: submitData.postalCode || getPostalCode(),
			subdivisionCode: select( 'wpcom' )?.getContactInfo?.()?.state?.value,
		},
		submitWpcomTransaction,
		transactionOptions
	).then( makeSuccessResponse );
}
