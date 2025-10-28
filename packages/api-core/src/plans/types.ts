export interface PlanProductFeatureHighlight {
	title?: string;
	items: string[];
}

export interface PlanProduct {
	// Core product properties
	product_id: number;
	product_name: string;
	product_slug: string;
	product_type: string;
	meta: string | null;
	bd_slug: string;
	bd_variation_slug: string;
	available: string;
	multi: number;
	blog_id: number | string | null;
	bundle_product_ids: number[];

	// Billing/pricing properties
	bill_period: number;
	bill_period_label?: string;
	orig_cost_integer: number;
	orig_cost: number | null;
	price: string;
	formatted_price: string;
	cost: number;
	raw_price_integer: number;
	raw_price: number;
	product_display_price: string;
	currency_code: string;

	// Descriptive properties
	description: string;
	tagline: string | null;
	features_highlight?: PlanProductFeatureHighlight[];

	// Introductory offer properties (conditional - only present when has_introductory_offer is true)
	has_introductory_offer?: boolean;
	introductory_offer_formatted_price?: string;
	introductory_offer_raw_price?: number;
	introductory_offer_raw_price_integer?: number;
	introductory_offer_interval_unit?: string;
	introductory_offer_interval_count?: number;
}

interface SiteSpecificPlanCostOverride {
	old_price: number;
	new_price: number;
	override_code: string;
	does_override_original_cost: boolean;
	human_readable_reason: string;
	percentage: number;
	first_unit_only: boolean;
}

export interface SiteSpecificPlanProduct {
	// Pricing fields (always present)
	formatted_original_price: string;
	original_price: {
		amount: number;
		currency: string;
	};
	raw_price: number;
	raw_price_integer: number;
	formatted_price: string;
	raw_discount: number;
	raw_discount_integer: number;
	formatted_discount: string;
	currency_code: string;

	// Product identification (always present)
	product_id: number;
	product_slug: string;
	product_name: string;

	// Discount/cost information (always present)
	discount_reason: string | null;
	cost_overrides: SiteSpecificPlanCostOverride[];
	is_domain_upgrade: boolean;

	// Billing interval (conditional - if bill_period is set)
	interval?: number;

	// Coupon-related fields (conditional - when coupon is applied)
	has_sale_coupon?: boolean;

	// Introductory offer fields (conditional - when offer exists)
	introductory_offer_formatted_price?: string;
	introductory_offer_raw_price?: number;
	introductory_offer_raw_price_integer?: number;
	introductory_offer_interval_unit?: string;
	introductory_offer_interval_count?: number;
	introductory_offer_end_date?: string | null; // Only when is_current_plan && has subscription

	// Current plan fields (conditional - when is_current_plan is true)
	current_plan?: boolean;

	// Subscription fields (conditional - when is_current_plan && !is_free)
	user_is_owner?: boolean | null;
	id?: number | null;
	has_domain_credit?: boolean | null;
	has_redeemed_domain_credit?: boolean;
	expiry?: string | null; // ISO 8601 date or null for partner plans
	free_trial?: boolean;
	subscribed_date?: string; // ISO 8601 date
	auto_renew?: boolean;
	auto_renew_date?: string; // ISO 8601 date
	partner_name?: string;
	user_facing_expiry?: string | null; // Deprecated, same as expiry

	// Trial availability (conditional - when !is_current_plan && !is_free)
	can_start_trial?: boolean;
}

export interface PlansDetailsResponse {
	groups: PlansDetailsGroup[];
	plans: PlansDetailsPlan[];
	features_by_type: FeatureCategory[];
	features: PlansDetailsFeature[];
}

export interface PlansDetailsGroup {
	slug: string;
	name: string;
}

export interface PlansDetailsPlan {
	support_priority: number;
	support_name: string;
	groups: string[];
	products: Array< { plan_id: number } >;
	name: string; // e.g., "WordPress.com Personal"
	short_name: string; // e.g., "Personal"
	nonlocalized_short_name: string;
	tagline: string; // Marketing string: "Best for personal use"
	description: string; // Marketing string: "Boost your website with a custom domain name..."
	features: string[]; // Array of feature IDs
	highlighted_features: string[]; // Marketing strings: ["Remove WordPress.com ads", "Email support", ...]
	storage: string; // e.g., "6 GB"
	icon: string;
}

export interface PlansDetailsFeature {
	id: string;
	name: string; // Marketing string: "Free domain for One Year"
	description: string; // Marketing string: "Get a free domain for one year..."
	type?: string;
}

export interface FeatureCategory {
	id: string;
	name: string | null;
	features: string[]; // Array of feature IDs
}
