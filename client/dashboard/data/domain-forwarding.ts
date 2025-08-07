import wpcom from 'calypso/lib/wp';

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

export function fetchDomainForwarding( domainName: string ): Promise< DomainForwarding[] > {
	return wpcom.req.get( `/sites/all/domain/${ domainName }/redirects`, { 'new-endpoint': 'true' } );
}

export function deleteDomainForwarding(
	domainName: string,
	forwardingId: number
): Promise< void > {
	return wpcom.req.post( `/sites/all/domain/${ domainName }/redirects/delete`, {
		domain_redirect_id: forwardingId,
	} );
}
