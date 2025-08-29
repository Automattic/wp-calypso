import wpcom from 'calypso/lib/wp';
import type { DomainSummary } from './domains';

export interface Domain extends DomainSummary {
	can_manage_name_servers: boolean;
	cannot_manage_name_servers_reason: null | string;
	dnssec_records?: {
		dnskey: string[];
		ds_data: string[];
	};
	has_wpcom_nameservers: boolean;
	is_dnssec_enabled: boolean;
	is_dnssec_supported: boolean;
	is_domain_only_site: boolean;
	is_gravatar_domain: boolean;
	is_root_domain_registered_with_automattic: boolean;
	is_subdomain: boolean;
	move_to_new_site_pending: boolean;
	private_domain: boolean;
	ssl_status: 'active' | 'inactive' | 'newly_registered' | 'pending';
	subdomain_part: string;
	auto_renewal_date: string;
	renewable_until: string;
}

export function fetchDomain( domainName: string ): Promise< Domain > {
	return wpcom.req.get( {
		path: `/domain-details/${ domainName }`,
		apiVersion: '1.2',
	} );
}

export function disconnectDomain( domainName: string ): Promise< void > {
	return wpcom.req.get( {
		path: `/domains/${ domainName }/disconnect-domain-from-site`,
	} );
}
