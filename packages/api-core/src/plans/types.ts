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
