export interface DomainForwarding {
	domain_redirect_id: number;
	domain: string;
	subdomain: string;
	fqdn: string;
	target_host: string;
	target_path: string;
	forward_paths: boolean;
	is_secure: boolean;
	is_permanent: boolean;
	is_active?: boolean;
	source_path?: string;
}

export interface DomainForwardingSaveData {
	domain_redirect_id?: number;
	subdomain?: string;
	forward_paths: boolean;
	target_host: string;
	target_path: string;
	is_secure: boolean;
	is_permanent: boolean;
}
