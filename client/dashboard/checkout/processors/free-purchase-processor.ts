/**
 * Free purchase processor for Dashboard checkout
 * Handles purchases with zero cost (free plans, 100% discounts, etc.)
 */
import {
	makeSuccessResponse,
	makeErrorResponse,
	type PaymentProcessorResponse,
} from '@automattic/composite-checkout';
import { createTransactionCart, createTransactionRequest } from '../transaction-utils';
import type { TransactionRequest } from '@automattic/api-core';
import type { DomainContactDetails, ResponseCart } from '@automattic/shopping-cart';

export interface FreePurchaseProcessorOptions {
	siteId: number;
	responseCart: ResponseCart;
	domainDetails?: DomainContactDetails | null;
	onAnalyticsEvent?: ( event: string, properties?: Record< string, unknown > ) => void;
}

/**
 * Process a free purchase transaction
 */
export async function freePurchaseProcessor(
	submitTransaction: ( request: TransactionRequest ) => Promise< unknown >,
	options: FreePurchaseProcessorOptions
): Promise< PaymentProcessorResponse > {
	const { siteId, responseCart, domainDetails, onAnalyticsEvent } = options;

	// Record analytics event
	onAnalyticsEvent?.( 'calypso_checkout_payment_method_submit', {
		payment_method: 'free-purchase',
	} );

	// Create the transaction cart
	const cart = createTransactionCart( {
		siteId,
		responseCart,
	} );

	// Create the transaction request with free purchase payment method
	const transactionRequest = createTransactionRequest( {
		cart,
		payment: {
			payment_method: 'WPCOM_Billing_WPCOM',
			name: '',
			country: '',
			postal_code: '',
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
