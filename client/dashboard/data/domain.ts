import wpcom from 'calypso/lib/wp';
import type { DomainSummary } from './domains';

export interface Domain extends DomainSummary {
	is_domain_only_site: boolean;
	is_gravatar_domain: boolean;
	move_to_new_site_pending: boolean;
	can_manage_name_servers: boolean;
	cannot_manage_name_servers_reason: null | string;
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
