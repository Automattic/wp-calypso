export interface DomainSuggestion {
	domain_name: string;
	cost: string;
	sale_cost?: string;
	renew_cost?: string;
	product_slug: string;
	is_premium?: boolean;
	is_free?: boolean;
	supports_privacy?: boolean;
}
