import type { IntroductoryOfferTerms } from '@automattic/shopping-cart';

export interface TaxVendorInfo {
	/**
	 * The country code for this info.
	 */
	country_code: string;

	/**
	 * The mailing address to display on receipts as a list of strings (each
	 * string should be on its own line).
	 */
	address: string[];

	/**
	 * An object containing tax names and corresponding vendor ids that are used for the user's country
	 *
	 * This will deprecate the vat_id and tax_name properties
	 * For now, those two properties will stay in place for backwards compatibility
	 *
	 * Key:   The localized name of the tax (eg: "VAT", "GST", etc.).
	 * Value: A8c vendor id for that specific tax
	 */
	tax_name_and_vendor_id_array: Record< string, string >;

	/**
	 * The localized name of the tax (eg: "VAT", "GST", etc.).
	 * @deprecated This is still in place for backwards compability with cached clients
	 */
	tax_name: string;
}

export interface ReceiptItemCostOverride {
	id: number;
	human_readable_reason: string;
	override_code: string;
	does_override_original_cost: boolean;
	old_price_integer: number;
	new_price_integer: number;
}

export interface ReceiptItem {
	id: number;
	type: string;
	type_localized: string;
	domain: string | null;
	site_id: number;
	subtotal_integer: number;
	tax_integer: number;
	amount_integer: number;
	currency: string;
	licensed_quantity: number;
	new_quantity: number;
	product: string;
	product_slug: string;
	variation: string;
	variation_slug: string;
	months_per_renewal_interval: number;
	wpcom_product_slug: string;
	cost_overrides: ReceiptItemCostOverride[];
	volume: number;
	credits_used: number | null;
	introductory_offer_terms: IntroductoryOfferTerms | null;
	price_tier_slug: string;
}

export interface Receipt {
	id: number;
	service: string;
	service_slug: string;
	currency: string;
	subtotal_integer: number;
	tax_integer: number;
	amount_integer: number;
	tax_country_code: string;
	date: string;
	desc: string;
	org: string;
	address: string | null;
	icon: string;
	url: string;
	support: string;
	pay_ref: string;
	pay_part: string;
	cc_type: string;
	cc_display_brand: string;
	cc_num: string;
	cc_name: string;
	cc_email: string;
	credit: string;
	items: ReceiptItem[];
	tax_vendor_info?: TaxVendorInfo;
}
