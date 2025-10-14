import type { IntroductoryOfferTerms } from '@automattic/shopping-cart';

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
	tax_vendor_info: string;
}
