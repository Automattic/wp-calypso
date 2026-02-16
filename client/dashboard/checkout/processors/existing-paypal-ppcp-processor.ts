/**
 * Existing (saved) PayPal PPCP processor for Dashboard checkout.
 * Handles payments using a PayPal account already saved to the user's profile.
 */
import {
	makeSuccessResponse,
	makeErrorResponse,
	type PaymentProcessorResponse,
} from '@automattic/composite-checkout';
import { createTransactionCart, createTransactionRequest } from '../transaction-utils';
import type { TransactionRequest } from '@automattic/api-core';
import type { DomainContactDetails, ResponseCart } from '@automattic/shopping-cart';

export interface ExistingPayPalPPCPSubmitData {
	email: string;
	storedDetailsId: string;
	paymentMethodToken: string;
	paymentPartnerProcessorId: string;
}

export interface ExistingPayPalPPCPProcessorOptions {
	siteId: number;
	responseCart: ResponseCart;
	countryCode?: string;
	postalCode?: string;
	subdivisionCode?: string;
	domainDetails?: DomainContactDetails | null;
}

/**
 * Process a payment using a saved PayPal PPCP account.
 */
export async function existingPayPalPPCPProcessor(
	submitData: ExistingPayPalPPCPSubmitData,
	submitTransaction: ( request: TransactionRequest ) => Promise< unknown >,
	options: ExistingPayPalPPCPProcessorOptions
): Promise< PaymentProcessorResponse > {
	const { siteId, responseCart, countryCode, postalCode, subdivisionCode, domainDetails } = options;

	const cart = createTransactionCart( { siteId, responseCart } );

	const transactionRequest = createTransactionRequest( {
		cart,
		payment: {
			payment_method: 'WPCOM_Billing_MoneyPress_Stored',
			payment_key: submitData.paymentMethodToken,
			stored_details_id: submitData.storedDetailsId,
			payment_partner: submitData.paymentPartnerProcessorId,
			name: submitData.email,
			email: submitData.email,
			country: countryCode,
			country_code: countryCode,
			postal_code: postalCode,
			zip: postalCode,
			state: subdivisionCode,
		},
		domainDetails: domainDetails ?? null,
	} );

	try {
		const response = await submitTransaction( transactionRequest );
		return makeSuccessResponse( response );
	} catch ( error ) {
		return makeErrorResponse( ( error as Error ).message );
	}
}
