import wpcom from 'calypso/lib/wp';
import type { DomainSetupInfo } from '../domains/domain-connection-setup/types';

export interface DomainMappingSetupInfo {
	default_ip_addresses: string[];
	wpcom_name_servers: string[];
	is_subdomain: boolean;
	connection_mode?: string;
	domain_connect_apply_wpcom_hosting?: boolean;
	is_supported_tld?: boolean;
}

export interface DomainMappingStatus {
	has_mapping_records: boolean;
	has_wpcom_nameservers: boolean;
	has_wpcom_ip_addresses: boolean;
	has_cloudflare_ip_addresses: boolean;
	resolves_to_wpcom: boolean;
	host_ip_addresses: string[];
	name_servers: string[];
	mode: string;
}

export function fetchDomainSetupInfo(
	domainName: string,
	siteId: number
): Promise< DomainSetupInfo > {
	return wpcom.req.get( `/domains/${ domainName }/mapping-setup-info/${ siteId }` );
}

export function updateConnectionModeAndGetMappingStatus(
	domainName: string,
	connectionMode: string
): Promise< DomainMappingStatus > {
	return wpcom.req.post( `/domains/${ domainName }/mapping-status`, {
		mode: connectionMode,
	} );
}
