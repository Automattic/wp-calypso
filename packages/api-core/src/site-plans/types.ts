import type { SubscriptionBillPeriodValue } from '../constants';

export interface SitePlansPageContext {
	header_message?: string;
	page_title?: string;
}

export interface PlanCardFeature {
	text: string;
	available: boolean;
}

export interface PlanProductComparisonGroup {
	group: string;
	features: PlanProductComparisonFeature[];
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

export interface SiteContextualPlanCostOverride {
	old_price: number;
	new_price: number;
	override_code: string;
	does_override_original_cost: boolean;
	human_readable_reason: string;
	percentage: number;
	first_unit_only: boolean;
}

export interface SiteContextualPlan {
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
	cost_overrides: SiteContextualPlanCostOverride[];
	is_domain_upgrade: boolean;

	// Billing interval (conditional - if bill_period is set)
	interval?: SubscriptionBillPeriodValue;

	// Coupon-related fields (conditional - when coupon is applied)
	has_sale_coupon?: boolean;

	// Introductory offer fields (conditional - when offer exists)
	introductory_offer_formatted_price?: string;
	introductory_offer_raw_price?: number;
	introductory_offer_raw_price_integer?: number;
	introductory_offer_interval_unit?: string;
	introductory_offer_interval_count?: number;
	introductory_offer_end_date?: string | null; // Only when current_plan && has subscription

	// This means that the plan is active but it could be past its expiry date.
	current_plan?: boolean;

	// Subscription fields (conditional - when current_plan && !is_free)
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

	// Trial availability (conditional - when !current_plan && !is_free)
	can_start_trial?: boolean;

	/**
	 * Whether the site's current plan can be upgraded to this plan. Computed by
	 * the server from the same upgrade-path authority the shopping cart uses.
	 * Present on non-current plans.
	 */
	available_for_upgrade?: boolean;

	/**
	 * Whether the site's current plan can be downgraded to this plan. Computed by
	 * the server from the same plan-path authority the shopping cart uses.
	 * Present on non-current plans.
	 */
	available_for_downgrade?: boolean;

	/**
	 * Whether this plan has passed its expiry date. If this is set on the
	 * current plan, that means that the plan is still active but is now within
	 * its grace period. Once the grace period ends, the plan will no longer be
	 * returned with current_plan: true.
	 */
	is_expired?: boolean;

	/**
	 * Display order for plan cards on the comparison page. Lower values appear first.
	 * Only present on plans that should be shown; absence means the plan is not displayed.
	 */
	plan_card_order?: number;

	/**
	 * Numeric ID shared by all billing-period variants of the same plan
	 * family. A product tier is one plan for a service which offers multiple
	 * levels of that plan. For example, on WPCOM we offer Personal, Premium,
	 * Business, and Commerce, which are each tiers. Within the Personal plan
	 * is Personal Monthly, Personal Annual, Personal Biennial, and Personal
	 * Triennial.
	 */
	product_tier_id?: number;

	/**
	 * product_id values for every billing-period variant of this plan family (inclusive).
	 * Use these to navigate between monthly / annual / biennial / triennial variants.
	 */
	product_tier_product_ids?: number[];

	// Display/marketing content (conditional - only present when plan_card_order is set)
	plan_card_name?: string | null;
	tagline?: string | null;
	plan_card_features?: PlanCardFeature[];
	features_comparison?: PlanProductComparisonGroup[];
	badges?: string[];
}
