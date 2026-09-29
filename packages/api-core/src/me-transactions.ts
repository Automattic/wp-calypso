import { wpcom } from './wpcom-fetcher';
import type { TaxVendorInfo } from './me-billing-history';

type PurchaseSiteId = number;

export interface TransactionResponsePurchase {
	delayed_provisioning?: boolean;
	expiry?: string;
	is_domain_registration: boolean;
	is_email_verified?: boolean;
	is_renewal: boolean;
	is_root_domain_with_us?: boolean;
	is_hundred_year_domain?: boolean;
	meta: string | null;
	new_quantity?: number;
	product_id: string | number;
	product_name: string;
	product_name_short: string;
	product_type: string;
	product_slug: string;
	registrar_support_url?: string;
	user_email: string;
	saas_redirect_url?: string;
	tax_vendor_info?: TaxVendorInfo;
	blog_id: number;
	price_integer?: number;
}

export interface FailedPurchase {
	product_meta: string;
	product_id: string | number;
	product_slug: string;
	product_cost: string | number;
	product_name: string;
}

export type WPCOMTransactionEndpointResponseSuccess = {
	success: true;
	purchases: Record< PurchaseSiteId, TransactionResponsePurchase[] >;
	failed_purchases: Record< PurchaseSiteId, FailedPurchase[] >;
	receipt_id: number;
	order_id: number | '';
	redirect_url?: string;
	paypal_order_id?: string;
	qr_code?: string;
	is_gift_purchase: boolean;
	display_price: string;
	price_integer: number;
	price_float: number;
	currency: string;
	is_gravatar_domain: boolean;
};

export type WPCOMTransactionEndpointResponseFailed = {
	success: false;
	purchases: Record< PurchaseSiteId, TransactionResponsePurchase[] >;
	failed_purchases: Record< PurchaseSiteId, FailedPurchase[] >;
	receipt_id: number;
	order_id: number | '';
	redirect_url?: string;
	qr_code?: string;
	is_gift_purchase: boolean;
	display_price: string;
	price_integer: number;
	price_float: number;
	currency: string;
	is_gravatar_domain: boolean;
};

export type WPCOMTransactionEndpointResponseRedirect = {
	message: { payment_intent_client_secret: string } | { setup_intent_client_secret: string } | '';
	order_id: number | '';
	redirect_url: string;
	qr_code?: string;
};

export type WPCOMTransactionEndpointResponsePayPal = {
	order_id: number | '';
	paypal_order_id: string;
	redirect_url?: string;
	qr_code?: string;
};

export type WPCOMTransactionEndpointResponse =
	| WPCOMTransactionEndpointResponseSuccess
	| WPCOMTransactionEndpointResponseFailed
	| WPCOMTransactionEndpointResponsePayPal
	| WPCOMTransactionEndpointResponseRedirect;

/**
 * @param body The request payload, already in the endpoint's snake_case shape.
 * Checkout builds it from `WPCOMTransactionEndpointRequestPayload` in
 * `@automattic/wpcom-checkout`.
 */
export async function createTransaction(
	body: Record< string, unknown >
): Promise< WPCOMTransactionEndpointResponse > {
	// The path must stay exactly `/me/transactions`: Calypso's fetcher adds the
	// `X-Fingerprint` header by matching on it (see `client/lib/wp/handlers/fingerprint.js`).
	return await wpcom.req.post( { path: '/me/transactions', body } );
}
