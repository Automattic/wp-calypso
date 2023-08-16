import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { domainRedirectsQueryKey } from './domain-redirects-query-key';

type DomainRedirectResponse = {
	domain: string;
	target_host: string;
	target_path: string;
	forward_paths: '0' | '1';
	is_secure: '0' | '1';
	is_permanent: '0' | '1';
	is_active: '0' | '1';
	source_path: string;
};

export default function useDomainRedirectQuery( domainName: string ) {
	return useQuery( {
		queryKey: domainRedirectsQueryKey( domainName ),
		queryFn: () => wp.req.get( `/sites/all/domain/${ domainName }/redirects` ),
		refetchOnWindowFocus: false,
		select: ( redirect: DomainRedirectResponse ) => {
			if ( redirect?.domain ) {
				return {
					domain: redirect.domain,
					targetHost: redirect.target_host,
					targetPath: redirect.target_path,
					forwardPaths: redirect.forward_paths === '1',
					isSecure: redirect.is_secure === '1',
					isPermanent: redirect.is_permanent === '1',
					isActive: redirect.is_active === '1',
					sourcePath: redirect.source_path,
				};
			}

			return undefined;
		},
	} );
}
