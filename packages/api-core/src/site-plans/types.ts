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
