/**
 * External dependencies
 */
import { defaultRegistry } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import {
	getDomainDetails,
	wpcomTransaction,
	submitApplePayPayment,
	submitStripeCardTransaction,
	submitCreditsTransaction,
} from './payment-method-helpers';
import { createStripePaymentMethod } from 'lib/stripe';

const { select, dispatch } = defaultRegistry;

export function applePayProcessor( submitData ) {
	const pending = submitApplePayPayment(
		{
			...submitData,
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

export async function stripeCardProcessor( submitData ) {
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

export async function existingCardProcessor( submitData ) {
	const pending = submitStripeCardTransaction(
		{
			...submitData,
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

export async function fullCreditsProcessor( submitData ) {
	const pending = submitCreditsTransaction(
		{
			...submitData,
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
