import { QueryKey } from '@tanstack/react-query';

export function domainForwardingQueryKey( domainName: string ): QueryKey {
	return [ 'domain-forwarding', domainName ];
}
