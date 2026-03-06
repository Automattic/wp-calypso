import type { SubscriptionBillPeriodValue } from '../constants';

export interface PlanProductFeatureHighlight {
	title?: string;
	items: string[];
}

export interface PlanCardFeature {
	text: string;
	available: boolean;
}

/**
 * A feature to display in the plans page comparison grid for this product.
 */
export interface PlanProductComparisonFeature {
	/**
	 * The unique ID of this feature.
	 */
	key: string;

	/**
	 * The feature description shown in the first column of the comparison grid
	 * (eg: "Accept all major card brands automatically").
	 */
	title: string;

	/**
	 * For products which have different tiers that have differing features,
	 * this list is the tiers where this feature should be shown. Each entry
	 * is the product_tier_id for that plan family (e.g. 1180 for Woo Basic,
	 * 1181 for Woo Pro). This is stable across all billing-period variants
	 * of a plan.
	 */
	tiers?: number[];

	/**
	 * If set, this feature will only be shown for versions of this product
	 * with the matching billing periods. The billing periods are numbers of
	 * days but are not literal renewal periods; they are numeric constants
	 * that represent each period. For example, `31` means "monthly" although
	 * the expiry date may be fewer than 31 days from the last renewal.
	 */
	billing_periods?: SubscriptionBillPeriodValue[];

	/**
	 * Per-tier display values shown in the comparison grid instead of a check
	 * mark. The key is the string form of product_tier_id (JSON object keys are
	 * always strings, e.g. "1180") and the value is a translated string shown in
	 * that tier's column (e.g. "10 GB" for tier 1180, "50 GB" for tier 1181).
	 * Tiers omitted from this map still show the default check mark.
	 */
	tier_values?: Record< string, string >;
}

export interface PlanProductComparisonGroup {
	group: string;
	features: PlanProductComparisonFeature[];
}

export interface PlanProductDowngrade {
	product_id: number;
	bill_period: number;
	product_slug: string;
	product_name: string;
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
	bill_period: SubscriptionBillPeriodValue;
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
	plan_card_name: string | null;
	features_highlight?: PlanProductFeatureHighlight[];
	plan_card_features?: PlanCardFeature[];
	features_comparison?: PlanProductComparisonGroup[];

	/** Numeric ID shared by all billing-period variants of the same plan family.
	 *  Matches product_tier_id on SiteContextualPlan. Used as the column identifier
	 *  in features_comparison (tiers[] and tier_values keys). */
	product_tier_id?: number;

	// Downgrade options
	downgrade_paths: PlanProductDowngrade[];

	// Introductory offer properties (conditional - only present when has_introductory_offer is true)
	has_introductory_offer?: boolean;
	introductory_offer_formatted_price?: string;
	introductory_offer_raw_price?: number;
	introductory_offer_raw_price_integer?: number;
	introductory_offer_interval_unit?: string;
	introductory_offer_interval_count?: number;
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
