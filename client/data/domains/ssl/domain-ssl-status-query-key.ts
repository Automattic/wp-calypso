import { QueryKey } from '@tanstack/react-query';

export function domainSSLStatusQueryKey( domainName: string ): QueryKey {
	return [ 'ssl-status', domainName ];
}
