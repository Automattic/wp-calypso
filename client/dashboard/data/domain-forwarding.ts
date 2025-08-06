import wp from 'calypso/lib/wp';

export interface DomainForwardingObject {
	domain_redirect_id: number;
	domain: string;
	subdomain: string;
	fqdn: string;
	target_host: string;
	target_path: string;
	forward_paths: true | false;
	is_secure: true | false;
	is_permanent: true | false;
	is_active?: true | false;
	source_path?: string;
}

export function fetchDomainForwarding( domainName: string ): Promise< DomainForwardingObject[] > {
	return wp.req.get( `/sites/all/domain/${ domainName }/redirects?new-endpoint=true` );
}

export function deleteDomainForwarding(
	domainName: string,
	forwardingId: number
): Promise< DomainForwardingObject[] > {
	return wp.req.post( `/sites/all/domain/${ domainName }/redirects/delete`, {
		domain_redirect_id: forwardingId,
	} );
}
