export interface DomainAvailabilityQuery {
	blog_id?: number;
	is_cart_pre_check?: boolean;
	vendor?: string;
}

export interface DomainAvailability {
	domain_name: string;
	tld: string;
	status: string;
	is_supported_premium_domain?: true;
	is_price_limit_exceeded?: true;
	mappable: string;
	supports_privacy: boolean;
	root_domain_provider: string;
	hsts_required?: true;
	dot_gay_notice_required?: true;
	cost: string;
	currency_code: string;
	renew_cost?: string;
	sale_cost?: number;
}
