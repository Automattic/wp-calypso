export interface SiteContextualPlan {
	id?: string | null;
	currency_code: string;
	current_plan?: boolean;
	expiry?: string;
	formatted_price: string;
	has_domain_credit?: boolean;
	product_name: string;
	product_slug: string;
	raw_price_integer: number;
	subscribed_date?: string;
	user_facing_expiry?: string;
}
