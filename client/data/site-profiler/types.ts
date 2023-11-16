export interface DNS {
	host: string;
	class: string;
	ttl: number;
	type: string;
	ip?: string;
	target?: string;
	mname?: string;
	rname?: string;
	serial?: number;
	refresh?: number;
	retry?: number;
	expire?: number;
	'minimum-ttl'?: number;
}

export interface WhoIs {
	admin_city?: string;
	admin_country?: string;
	admin_email?: string;
	admin_name?: string;
	admin_organization?: string;
	admin_phone?: string;
	admin_postal_code?: string;
	admin_state?: string;
	admin_street?: string | string[];
	creation_date?: string;
	domain_name?: string;
	name_server?: string | string[];
	registrant_city?: string;
	registrant_country?: string;
	registrant_email?: string;
	registrant_name?: string;
	registrant_organization?: string;
	registrant_phone?: string;
	registrant_postal_code?: string;
	registrant_state?: string;
	registrant_street?: string | string[];
	registrar?: string | string[];
	registrar_iana_id?: string;
	registrar_url?: string;
	registrar_whois_server?: string;
	registry_domain_id?: string;
	registry_expiry_date?: string;
	reseller?: string;
	status?: string;
	tech_city?: string;
	tech_country?: string;
	tech_email?: string;
	tech_name?: string;
	tech_organization?: string;
	tech_phone?: string;
	tech_postal_code?: string;
	tech_state?: string;
	tech_street?: string | string[];
	updated_date?: string;
}

export interface HostingProvider {
	slug: string;
	name: string;
	is_cdn: boolean;
	support_url?: string;
	homepage_url?: string;
}

export interface DomainAnalyzerQueryResponse {
	domain: string;
	whois: WhoIs;
	dns: DNS[];
	is_domain_available: boolean;
	eligible_google_transfer: boolean;
}

export interface DomainAnalyzerWhoisRawDataQueryResponse {
	domain: string;
	whois: string[];
}

export interface HostingProviderQueryResponse {
	domain: string;
	hosting_provider: HostingProvider;
}
