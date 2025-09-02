import type { DomainSummary } from '../domains';

export interface Domain extends DomainSummary {
	auth_code_required: boolean;
	auto_renewal_date: string;
	can_manage_name_servers: boolean;
	can_transfer_to_any_user: boolean;
	can_transfer_to_other_site: boolean;
	cannot_manage_name_servers_reason: null | string;
	dnssec_records?: {
		dnskey: string[];
		ds_data: string[];
	};
	domain_locking_available: boolean;
	has_wpcom_nameservers: boolean;
	is_dnssec_enabled: boolean;
	is_dnssec_supported: boolean;
	is_domain_only_site: boolean;
	is_gravatar_domain: boolean;
	is_gravatar_restricted_domain: boolean;
	is_locked: boolean;
	is_root_domain_registered_with_automattic: boolean;
	is_subdomain: boolean;
	move_to_new_site_pending: boolean;
	private_domain: boolean;
	privacy_available: boolean;
	renewable_until: string;
	ssl_status: 'active' | 'inactive' | 'newly_registered' | 'pending';
	subdomain_part: string;
	transfer_away_eligible_at: string;
}
