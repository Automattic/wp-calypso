export interface DomainAvailabilityQuery {
	blog_id?: number;
	is_cart_pre_check?: boolean;
	vendor?: string;
}

export interface DomainAvailability {
	/**
	 * The domain name
	 * @example "example.com"
	 */
	domain_name: string;

	/**
	 * The top level domain
	 * @example "com"
	 */
	tld: string;

	/**
	 * Domain availability status
	 */
	status: string;

	/**
	 * Whether the domain is a supported premium domain
	 */
	is_supported_premium_domain?: true;

	/**
	 * Whether the domain price exceeds the limit
	 */
	is_price_limit_exceeded?: true;

	/**
	 * Domain mappability status
	 */
	mappable: string;

	/**
	 * Whether the domain supports privacy
	 */
	supports_privacy: boolean;

	/**
	 * The domain provider
	 */
	root_domain_provider: string;

	/**
	 * Whether the client should show the SSL certificate notice
	 */
	hsts_required?: true;

	/**
	 * Whether the client should show the dot gay notice
	 */
	dot_gay_notice_required?: true;

	/**
	 * Rendered formatted cost
	 * @example "Free" or "€15.00"
	 */
	cost: string;

	/**
	 * Currency code
	 * @example USD
	 */
	currency_code: string;

	/**
	 * Renewal cost
	 * @example "€15.00"
	 */
	renew_cost?: string;

	/**
	 * Sale cost
	 * @example 10.9
	 */
	sale_cost?: number;
}
