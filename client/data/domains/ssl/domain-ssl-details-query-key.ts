import { QueryKey } from '@tanstack/react-query';

export function domainSSLDetailsQueryKey( domainName: string ): QueryKey {
	return [ 'ssl-details', domainName ];
}
