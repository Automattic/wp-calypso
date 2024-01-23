import { QueryKey } from '@tanstack/react-query';

export function domainDiagnosticsQueryKey( domainName: string ): QueryKey {
	return [ 'domain-diagnostics', domainName ];
}
