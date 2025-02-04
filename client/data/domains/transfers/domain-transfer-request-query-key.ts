import { QueryKey } from '@tanstack/react-query';

export function domainTransferRequestQueryKey( siteSlug: string, domainName: string ): QueryKey {
	return [ 'domain-transfer-request', siteSlug, domainName ];
}
