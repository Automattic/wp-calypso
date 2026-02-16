/**
 * PayPal PPCP (Complete Payments) processor for Dashboard checkout.
 *
 * This uses the PayPal JS SDK embedded button flow, where the user stays on the
 * page and a PayPal dialog appears for confirmation. The flow requires two API
 * calls and a series of coordinated Promises shared with the UI button component:
 *
 * 1. Submit transaction to /me/transactions with WPCOM_Billing_PayPal_PPCP — receives paypal_order_id
 * 2. Resolve resolvePayPalOrderPromise(paypal_order_id) → triggers PayPal dialog
 * 3. Await payPalApprovalPromise → user approves in dialog
 * 4. Confirm payment at /me/paypal-ppcp-confirm-payment
 */
import {
	makeSuccessResponse,
	makeErrorResponse,
	type PaymentProcessorResponse,
} from '@automattic/composite-checkout';
import { createTransactionCart, createTransactionRequest } from '../transaction-utils';
import type {
	TransactionRequest,
	PayPalPPCPConfirmRequest,
	PayPalPPCPConfirmResponse,
} from '@automattic/api-core';
import type { DomainContactDetails, ResponseCart } from '@automattic/shopping-cart';

export interface PayPalPPCPSubmitData {
	/** Called with the PayPal order ID once the WPCOM transaction is created. Resolves the createOrder Promise in PayPalButtons. */
	resolvePayPalOrderPromise: ( payPalOrderId: string ) => void;
	/** Resolves when the user approves the payment in the PayPal dialog. */
	payPalApprovalPromise: Promise< void >;
}

export interface PayPalPPCPProcessorOptions {
	siteId: number;
	responseCart: ResponseCart;
	countryCode?: string;
	postalCode?: string;
	subdivisionCode?: string;
	successUrl: string;
	cancelUrl: string;
	domainDetails?: DomainContactDetails | null;
}

function isValidSubmitData( data: unknown ): data is PayPalPPCPSubmitData {
	return (
		typeof data === 'object' &&
		data !== null &&
		'resolvePayPalOrderPromise' in data &&
		'payPalApprovalPromise' in data
	);
}

/**
 * Process a new PayPal PPCP payment using the embedded button flow.
 */
export async function payPalPPCPProcessor(
	submitData: unknown,
	submitTransaction: ( request: TransactionRequest ) => Promise< unknown >,
	confirmPayment: ( request: PayPalPPCPConfirmRequest ) => Promise< PayPalPPCPConfirmResponse >,
	options: PayPalPPCPProcessorOptions
): Promise< PaymentProcessorResponse > {
	if ( ! isValidSubmitData( submitData ) ) {
		return makeErrorResponse( 'Missing PayPal promise data' );
	}

	const { siteId, responseCart, countryCode, postalCode, successUrl, cancelUrl, domainDetails } =
		options;

	const cart = createTransactionCart( { siteId, responseCart } );

	const transactionRequest = createTransactionRequest( {
		cart,
		payment: {
			payment_method: 'WPCOM_Billing_PayPal_PPCP',
			country: countryCode,
			country_code: countryCode,
			postal_code: postalCode,
			success_url: successUrl,
			cancel_url: cancelUrl,
		},
		domainDetails: domainDetails ?? null,
	} );

	try {
		const response = await submitTransaction( transactionRequest );
		const txResponse = response as { paypal_order_id?: string; order_id?: number };

		if ( ! txResponse.paypal_order_id ) {
			return makeErrorResponse( 'Transaction response did not include a PayPal order ID.' );
		}
		if ( ! txResponse.order_id ) {
			return makeErrorResponse( 'Transaction response did not include a WordPress.com order ID.' );
		}

		// Resolve the PayPal button's createOrder Promise — this triggers the PayPal dialog.
		submitData.resolvePayPalOrderPromise( txResponse.paypal_order_id );

		// Wait for the user to approve the payment in the PayPal dialog.
		await submitData.payPalApprovalPromise;

		// Capture the payment after dialog approval.
		const confirmResponse = await confirmPayment( {
			bd_order_id: String( txResponse.order_id ),
			paypal_order_id: txResponse.paypal_order_id,
		} );

		if ( 'error' in confirmResponse ) {
			if (
				confirmResponse.error === 'paypal_ppcp_payment_confirm_no_order' &&
				confirmResponse.message
			) {
				return makeErrorResponse( confirmResponse.message );
			}
			if (
				confirmResponse.error === 'paypal_ppcp_payment_confirm_status_wrong' &&
				confirmResponse.message
			) {
				return makeErrorResponse( confirmResponse.message );
			}
			return makeErrorResponse( 'Transaction could not be completed' );
		}

		return makeSuccessResponse( response );
	} catch ( error ) {
		return makeErrorResponse( ( error as Error ).message ?? 'PayPal transaction failed.' );
	}
}
