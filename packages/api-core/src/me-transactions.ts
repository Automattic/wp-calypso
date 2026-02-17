import { wpcom } from './wpcom-fetcher';
import type { RequestCart } from '@automattic/shopping-cart';

/**
 * Domain contact details in the snake_case format expected by the transactions
 * and paypal-express-url API endpoints.
 */
export interface DomainDetailsForTransaction {
	first_name?: string;
	last_name?: string;
	organization?: string;
	email?: string;
	phone?: string;
	address_1?: string;
	address_2?: string;
	city?: string;
	state?: string;
	postal_code?: string;
	country_code?: string;
	fax?: string;
	vat_id?: string;
	extra?: {
		ca?: { lang?: string; legal_type?: string; cira_agreement_accepted?: boolean };
		uk?: { registrant_type?: string; registration_number?: string; trading_name?: string };
		fr?: {
			registrant_type?: string;
			registrant_vat_id?: string;
			trademark_number?: string;
			siren_siret?: string;
		};
	};
}

export interface TransactionPayment {
	payment_method: string;
	payment_key?: string;
	payment_partner?: string;
	stored_details_id?: string;
	name?: string;
	email?: string;
	country?: string;
	country_code?: string;
	state?: string;
	postal_code?: string;
	zip?: string;
	city?: string;
	address?: string;
	street_number?: string;
	phone_number?: string;
	document?: string;
	device_id?: string;
	success_url?: string;
	cancel_url?: string;
	ideal_bank?: string;
	pan?: string;
	gstin?: string;
	nik?: string;
	use_for_all_subscriptions?: boolean;
	event_source?: string;
}

export interface TransactionRequest {
	cart: RequestCart;
	domain_details?: DomainDetailsForTransaction | null;
	payment: TransactionPayment;
	tos?: Record< string, unknown >;
	ad_conversion?: {
		ad_details?: string;
		sensitive_pixel_options?: string;
	};
}

export interface TransactionResponse {
	success: boolean;
	order_id?: number;
	receipt_id?: number;
	purchases?: Record< string, unknown >;
	failed_purchases?: Record< string, unknown >;
	redirect_url?: string;
	paypal_order_id?: string;
	message?: {
		requires_action?: boolean;
		payment_intent_id?: string;
		payment_intent_client_secret?: string;
	};
}

export type PurchaseOrderProcessingStatus =
	| 'processing'
	| 'async-pending'
	| 'success'
	| 'error'
	| 'payment-failure';

export interface PurchaseOrder {
	order_id: number;
	user_id: number;
	receipt_id?: number;
	processing_status: PurchaseOrderProcessingStatus;
}

export interface PayPalConfigurationResponse {
	client_id: string | undefined;
}

export interface PayPalPPCPConfirmRequest {
	bd_order_id: string;
	paypal_order_id: string;
}

export type PayPalPPCPConfirmResponse = { success: true } | { error: string; message: string };

export interface PayPalExpressRequest {
	success_url: string;
	cancel_url: string;
	cart: RequestCart;
	country: string;
	postal_code: string;
	domain_details?: DomainDetailsForTransaction | null;
	tos?: Record< string, unknown >;
}

export interface PayPalExpressResponse {
	redirect_url?: string;
	success: boolean;
}

/**
 * Fetch the current status of an in-progress order.
 */
export async function fetchPurchaseOrder( orderId: number ): Promise< PurchaseOrder > {
	return await wpcom.req.get( `/me/transactions/order/${ orderId }`, { apiVersion: '1.1' } );
}

/**
 * Submit a transaction to the WPCOM transactions endpoint
 */
export async function submitTransaction(
	request: TransactionRequest
): Promise< TransactionResponse > {
	return await wpcom.req.post( {
		path: '/me/transactions',
		body: request,
	} );
}

/**
 * Fetch PayPal PPCP client configuration (client ID)
 */
export async function getPayPalConfiguration(): Promise< PayPalConfigurationResponse > {
	return await wpcom.req.get( { path: '/me/paypal-configuration' } );
}

/**
 * Confirm a PayPal PPCP payment after user approval in the PayPal dialog
 */
export async function confirmPayPalPPCPPayment(
	request: PayPalPPCPConfirmRequest
): Promise< PayPalPPCPConfirmResponse > {
	return await wpcom.req.post( {
		path: '/me/paypal-ppcp-confirm-payment',
		body: request,
	} );
}

/**
 * Get PayPal Express checkout URL
 */
export async function getPayPalExpressUrl(
	request: PayPalExpressRequest
): Promise< PayPalExpressResponse > {
	return await wpcom.req.post( {
		path: '/me/paypal-express-url',
		body: request,
		apiVersion: '1.2',
	} );
}
