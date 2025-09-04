export type DomainMappingStatus = {
	has_mapping_records: boolean;
	has_wpcom_nameservers: boolean;
	has_wpcom_ip_addresses: boolean;
	has_cloudflare_ip_addresses: boolean;
	resolves_to_wpcom: boolean;
	host_ip_addresses: string[];
	name_servers: string[];
	mode: string;
};

export type DomainSetupInfo = {
	connection_mode?: string;
	domain_connect_apply_wpcom_hosting?: boolean;
	domain_connect_provider_id?: string;
	default_ip_addresses?: string[];
	wpcom_name_servers?: string[];
	is_subdomain?: boolean;
	is_supported_tld?: boolean;
};
