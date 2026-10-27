import { wpcom } from './wpcom-fetcher';
import type { TaxVendorInfo } from './me-billing-history';
import type { RequestCart } from '@automattic/shopping-cart';

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

export interface ToSAcceptanceTrackingDetails {
	path: string;
	locale: string;
	viewport: string;
}

export interface AdConversionDetails {
	ad_details: string;
	sensitive_pixel_options: string;
}

export interface TransactionDomainContactDetails {
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
	extra?: TransactionDomainContactExtraDetails;
}

export interface TransactionDomainContactExtraDetails {
	ca?: {
		lang?: string;
		legal_type?: string;
		cira_agreement_accepted?: boolean;
	} | null;
	uk?: {
		registrant_type?: string;
		registration_number?: string;
		trading_name?: string;
	} | null;
	fr?: {
		registrant_type?: string;
		registrant_vat_id?: string;
		trademark_number?: string;
		siren_siret?: string;
	} | null;
	in?: {
		nexus_declaration?: boolean;
		nexus_connection_type?: string;
	} | null;
	es?: {
		registrant_entity_type?: string;
		registrant_identification_number?: string;
		admin_identification_number?: string;
		red_es_agreement_accepted?: boolean;
		red_es_agreement_version?: string;
	} | null;
}

export interface WPCOMTransactionEndpointPaymentDetails {
	payment_method: string;
	payment_key?: string;
	payment_partner?: string;
	stored_details_id?: string;
	name: string;
	email?: string;
	zip: string;
	postal_code: string;
	country: string;
	country_code: string;
	state?: string;
	city?: string;
	address?: string;
	street_number?: string;
	phone_number?: string;
	document?: string;
	is_for_business?: boolean;
	device_id?: string;
	success_url?: string;
	cancel_url?: string;
	ideal_bank?: string;
	// 6-digit BLIK code generated in the customer's banking app.
	code?: string;
	use_for_all_subscriptions?: boolean;
	event_source?: string;
}

/**
 * The request body for `/me/transactions` (`WPCOM_JSON_API_Transactions_Endpoint`).
 */
export interface WPCOMTransactionEndpointRequestPayload {
	cart: RequestCart;
	payment: WPCOMTransactionEndpointPaymentDetails;
	domain_details?: TransactionDomainContactDetails;
	tos?: ToSAcceptanceTrackingDetails;
	ad_conversion?: AdConversionDetails;
}

export async function createTransaction(
	body: WPCOMTransactionEndpointRequestPayload
): Promise< WPCOMTransactionEndpointResponse > {
	// The path must stay exactly `/me/transactions`: Calypso's fetcher adds the
	// `X-Fingerprint` header by matching on it (see `client/lib/wp/handlers/fingerprint.js`).
	return await wpcom.req.post( { path: '/me/transactions', body } );
}
