import { QueryKey } from '@tanstack/react-query';

export function sslDetailsQueryKey( domainName: string ): QueryKey {
	return [ 'ssl-details', domainName ];
}
