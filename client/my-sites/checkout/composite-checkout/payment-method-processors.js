/**
 * External dependencies
 */
import {
	defaultRegistry,
	makeSuccessResponse,
	makeRedirectResponse,
} from '@automattic/composite-checkout';
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
import submitWpcomTransaction from './lib/submit-wpcom-transaction';

const { select } = defaultRegistry;

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
