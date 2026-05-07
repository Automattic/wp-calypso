/**
 * A saved payment method (card, PayPal agreement or vaulted method, or Razorpay emandate).
 *
 * Used by the `/me/payment-methods` endpoint after version 1.1.
 */
export type StoredPaymentMethod =
	| StoredPaymentMethodBase
	| StoredPaymentMethodPayPal
	| StoredPaymentMethodRazorpay
	| StoredPaymentMethodCard
	| StoredPaymentMethodEbanx
	| StoredPaymentMethodStripeSource
	| RetiredStoredPaymentMethod;

export interface StoredPaymentMethodBase {
	stored_details_id: string;
	user_id: string;
	name: string;
	country_code: string;
	payment_partner: string;
	payment_partner_reference: string;
	payment_partner_source_id: string;
	mp_ref: string;
	email: string;
	card_expiry_year: string | null;
	card_expiry_month: string | null;
	expiry: string;
	remember: boolean;
	source: string | null;
	original_stored_details_id: string;
	is_rechargeable: boolean;
	payment_type: string | null;
	is_expired: boolean;
	is_backup: boolean;
	tax_location: StoredPaymentMethodTaxLocation | null;
}

export interface StoredPaymentMethodPayPal extends StoredPaymentMethodBase {
	payment_partner: 'paypal_express' | 'paypal_ppcp';
}

export interface StoredPaymentMethodCard extends StoredPaymentMethodBase {
	card_type: string;
	card_iin: string;
	card_last_4: string;
	card_zip: string;
	display_brand: string | null;
}

export interface StoredPaymentMethodEbanx extends StoredPaymentMethodBase {
	address: string;
	street_number: string;
	city: string;
	state: string;
	document: string;
	phone_number: string;
	device_id: string;
}

export interface StoredPaymentMethodStripeSource extends StoredPaymentMethodBase {
	verified_name: string;
	iban_last4: string;
	bank: string;
	bic: string;
}

export interface StoredPaymentMethodRazorpay extends StoredPaymentMethodBase {
	payment_partner: 'razorpay';
	razorpay_vpa: string;
}

/**
 * A stored payment method whose payment processor has been retired.
 *
 * Emitted by the `/me/payment-methods` endpoint when the row is hydrated by
 * the `Retired_Stored_Payment_Method` PHP class (rather than a partner-specific
 * subclass that has been deleted). The `retired: true` literal is the
 * discriminator for narrowing — live arms don't carry the property at all.
 *
 * `display_meta` carries the registry-declared display fields for the partner
 * (e.g. `razorpay_vpa` for retired Razorpay rows). Values are always strings;
 * keys with no underlying meta row are omitted from the envelope rather than
 * emitted as null.
 */
export interface RetiredStoredPaymentMethod extends StoredPaymentMethodBase {
	retired: true;
	display_meta: Record< string, string >;
}

export interface StoredPaymentMethodTaxLocation {
	country_code?: string;
	postal_code?: string;
	subdivision_code?: string;
	ip_address?: string;
	vat_id?: string;
	organization?: string;
	address?: string;
	city?: string;
	is_for_business?: boolean | undefined;
}

export type PaymentMethodRequestType = 'card' | 'agreement' | 'vault-token' | 'all';
