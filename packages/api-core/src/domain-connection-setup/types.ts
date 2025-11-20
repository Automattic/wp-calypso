export const DomainConnectionSetupMode = {
	SUGGESTED: 'suggested',
	ADVANCED: 'advanced',
	DC: 'dc',
	DONE: 'done',
	OWNERSHIP_VERIFICATION: 'ownership_verification',
	TRANSFER: 'transfer',
} as const;

export type DomainConnectionSetupModeValue =
	( typeof DomainConnectionSetupMode )[ keyof typeof DomainConnectionSetupMode ];

export type DomainMappingStatus = {
	has_mapping_records: boolean;
	has_wpcom_nameservers: boolean;
	has_wpcom_ip_addresses: boolean;
	has_cloudflare_ip_addresses: boolean;
	has_mx_records: boolean;
	www_cname_record_target: string | null;
	resolves_to_wpcom: boolean;
	host_ip_addresses: string[];
	name_servers: string[];
	mode: DomainConnectionSetupModeValue | null;
};

export type DomainMappingSetupInfo = {
	connection_mode: DomainConnectionSetupModeValue | null;
	domain_connect_apply_wpcom_hosting: string | null;
	domain_connect_provider_id: string | null;
	default_ip_addresses: string[];
	wpcom_name_servers: string[];
	is_subdomain: boolean;
	root_domain: string;
	registrar_url: string | null;
	registrar: string | null;
	registrar_iana_id: string | null;
	reseller: string | null;
};
