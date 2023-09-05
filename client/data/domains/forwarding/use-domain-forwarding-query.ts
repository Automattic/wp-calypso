import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { domainForwardingQueryKey } from './domain-forwarding-query-key';

type DomainForwardingResponse = {
	domain_redirect_id: number;
	domain: string;
	subdomain: string;
	target_host: string;
	target_path: string;
	forward_paths: '0' | '1';
	is_secure: '0' | '1';
	is_permanent: '0' | '1';
	is_active: '0' | '1';
	source_path: string;
};

export default function useDomainForwardingQuery( domainName: string ) {
	return useQuery( {
		queryKey: domainForwardingQueryKey( domainName ),
		queryFn: () => wp.req.get( `/sites/all/domain/${ domainName }/redirects` ),
		refetchOnWindowFocus: false,
		select: ( forwarding: DomainForwardingResponse ) => {
			if ( forwarding?.domain ) {
				return {
					domain_redirect_id: forwarding.domain_redirect_id,
					domain: forwarding.domain,
					subdomain: forwarding.subdomain,
					targetHost: forwarding.target_host,
					targetPath: forwarding.target_path,
					forwardPaths: forwarding.forward_paths === '1',
					isSecure: forwarding.is_secure === '1',
					isPermanent: forwarding.is_permanent === '1',
					isActive: forwarding.is_active === '1',
					sourcePath: forwarding.source_path,
				};
			}

			return undefined;
		},
	} );
}
