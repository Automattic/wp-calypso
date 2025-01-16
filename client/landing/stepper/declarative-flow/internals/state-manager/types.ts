import { DomainSuggestion } from '@automattic/data-stores';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';

export interface DomainStepResult {
	stepName?: 'domains';
	suggestion?: DomainSuggestion;
	shouldHideFreePlan?: boolean;
	signupDomainOrigin?: string;
	siteUrl?: string;
	lastDomainSearched?: string;
	domainCart?: DomainCart[] | object;
	shouldSkipSubmitTracking?: boolean;
	domainItem?: DomainSuggestion;
}

export interface DomainCart {
	product_id: number;
	billing_plan_id: string;
	product_name: string;
	product_name_en: string;
	product_slug: string;
	meta: string;
	cost: number;
	currency: string;
	volume: number;
	quantity: number | null;
	current_quantity?: number | null;
	introductory_offer_terms?: any;
	coupon_savings_integer: number;
	is_sale_coupon_applied: boolean;
	extra: DomainsExtra;
	bill_period: string;
	months_per_bill_period: number;
	is_domain_registration: boolean;
	time_added_to_cart: number;
	is_bundled: boolean;
	item_original_cost: number;
	item_original_cost_integer: number;
	item_original_monthly_cost_integer: number;
	item_original_cost_for_quantity_one_integer: number;
	item_subtotal_monthly_cost_integer: number;
	item_original_subtotal: number;
	item_original_subtotal_integer: number;
	item_subtotal: number;
	item_subtotal_integer: number;
	item_tax: number;
	item_tax_rate: number;
	item_tax_breakdown: any[];
	item_total: number;
	item_total_integer: number;
	subscription_id: number;
	is_renewal: boolean;
	is_renewal_and_will_auto_renew: boolean;
	is_one_time_purchase: boolean;
	cost_overrides: CostOverride[];
	is_gift_purchase: boolean;
	product_variants: ProductVariant[];
	is_included_for_100yearplan: boolean;
	stored_details_id?: any;
	subscription_current_expiry_date?: any;
	subscription_post_purchase_expiry_date: string;
	uuid: string;
}

export interface ProductVariant {
	introductory_offer_terms: IntroductoryOfferTerms;
	price_before_discounts_integer: number;
	introductory_offer_discount_integer: number;
	price_integer: number;
	bill_period_in_months: number;
	currency: string;
	product_id: number;
	product_slug: string;
	volume: number;
}

export interface IntroductoryOfferTerms {}

export interface CostOverride {
	old_price: number;
	old_price_integer: number;
	new_price: number;
	new_price_integer: number;
	old_subtotal: number;
	old_subtotal_integer: number;
	new_subtotal: number;
	new_subtotal_integer: number;
	override_code: string;
	does_override_original_cost: boolean;
	percentage: number;
	first_unit_only: boolean;
	human_readable_reason: string;
}

export interface DomainsExtra {
	privacy_available: boolean;
	privacy: boolean;
	added_from_shopping_cart: boolean;
	registrar: string;
	domain_registration_agreement_url: string;
	legal_agreements: any[];
	premium: boolean;
}

export interface PlansStepResult {
	stepName: 'plans';
	cartItems: MinimalRequestCartProduct[] | null;
}
