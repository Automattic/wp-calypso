import { QueryKey } from '@tanstack/react-query';

export function domainRedirectsQueryKey( domainName: string ): QueryKey {
	return [ 'domain-redirects', domainName ];
}
