export interface WhoIs {
	admin_city: string;
	admin_country: string;
	admin_email: string;
	admin_name: string;
	admin_organization: string;
	admin_phone: string;
	admin_postal_code: string;
	admin_state: string;
	admin_street: string;
	creation_date: string;
	domain_name: string;
	name_server: string[];
	registrant_city: string;
	registrant_country: string;
	registrant_email: string;
	registrant_name: string;
	registrant_organization: string;
	registrant_phone: string;
	registrant_postal_code: string;
	registrant_state: string;
	registrant_street: string;
	registrar: string;
	registrar_iana_id: string;
	registrar_url: string;
	registrar_whois_server: string;
	registry_domain_id: string;
	registry_expiry_date: string;
	reseller: string;
	status: string;
	tech_city: string;
	tech_country: string;
	tech_email: string;
	tech_name: string;
	tech_organization: string;
	tech_phone: string;
	tech_postal_code: string;
	tech_state: string;
	tech_street: string;
	updated_date: string;
}

export interface DomainAnalyzerQueryResponse {
	domain: string;
	hosting_provider: {
		name: string;
	};
	whois: WhoIs;
	dns: any;
}

export interface DomainAnalyzerWhoisRawDataQueryResponse {
	domain: string;
	whois: string[];
}
