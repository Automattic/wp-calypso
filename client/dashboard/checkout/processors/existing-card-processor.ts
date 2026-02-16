/**
 * Existing (stored) card processor for Dashboard checkout
 * Handles payments using cards already saved to the user's account
 */
import { confirmStripePaymentIntent } from '@automattic/calypso-stripe';
import {
	makeSuccessResponse,
	makeErrorResponse,
	type PaymentProcessorResponse,
} from '@automattic/composite-checkout';
import { createTransactionCart, createTransactionRequest } from '../transaction-utils';
import type { TransactionRequest, TransactionResponse } from '@automattic/api-core';
import type { DomainContactDetails, ResponseCart } from '@automattic/shopping-cart';
import type { Stripe } from '@stripe/stripe-js';

export interface ExistingCardProcessorSubmitData {
	name: string;
	storedDetailsId: string;
	paymentMethodToken: string;
	paymentPartnerProcessorId: string;
}

export interface ExistingCardProcessorOptions {
	siteId: number;
	responseCart: ResponseCart;
	stripe?: Stripe | null;
	countryCode?: string;
	postalCode?: string;
	subdivisionCode?: string;
	domainDetails?: DomainContactDetails | null;
}

/**
 * Returns true if the transaction response requires a 3DS authentication challenge.
 */
function doesResponseRequire3DS( response: unknown ): response is TransactionResponse & {
	message: { requires_action: true; payment_intent_client_secret: string };
} {
	if ( ! response || typeof response !== 'object' ) {
		return false;
	}
	const r = response as TransactionResponse;
	return !! ( r.message?.requires_action && r.message?.payment_intent_client_secret );
}

/**
 * Process a payment using a stored (saved) credit card
 */
export async function existingCardProcessor(
	submitData: ExistingCardProcessorSubmitData,
	submitTransaction: ( request: TransactionRequest ) => Promise< unknown >,
	options: ExistingCardProcessorOptions
): Promise< PaymentProcessorResponse > {
	const { siteId, responseCart, stripe, countryCode, postalCode, domainDetails } = options;

	const cart = createTransactionCart( {
		siteId,
		responseCart,
	} );

	const transactionRequest = createTransactionRequest( {
		cart,
		payment: {
			payment_method: 'WPCOM_Billing_MoneyPress_Stored',
			payment_key: submitData.paymentMethodToken,
			stored_details_id: submitData.storedDetailsId,
			payment_partner: submitData.paymentPartnerProcessorId,
			name: submitData.name,
			country: countryCode,
			country_code: countryCode,
			postal_code: postalCode,
			zip: postalCode,
		},
		domainDetails: domainDetails ?? null,
	} );

	let response: unknown;
	try {
		response = await submitTransaction( transactionRequest );
	} catch ( error ) {
		return makeErrorResponse( ( error as Error ).message );
	}

	// Handle 3DS challenge if required
	if ( doesResponseRequire3DS( response ) ) {
		if ( ! stripe ) {
			return makeErrorResponse(
				'This card requires additional authentication but Stripe is not available.'
			);
		}
		try {
			await confirmStripePaymentIntent( stripe, response.message.payment_intent_client_secret );
		} catch ( error ) {
			return makeErrorResponse( ( error as Error ).message );
		}
	}

	return makeSuccessResponse( response );
}
