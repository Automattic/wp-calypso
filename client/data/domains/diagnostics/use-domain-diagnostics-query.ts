import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { DomainDiagnostics } from 'calypso/lib/domains/types';
import wp from 'calypso/lib/wp';
import { domainDiagnosticsQueryKey } from './domain-diagnostics-query-key';

export default function useDomainDiagnosticsQuery(
	domainName: string,
	queryOptions = {}
): UseQueryResult< DomainDiagnostics > {
	return useQuery( {
		queryKey: domainDiagnosticsQueryKey( domainName ),
		queryFn: () =>
			wp.req.get( {
				path: `/domains/diagnostics/${ domainName }`,
				apiNamespace: 'wpcom/v2',
			} ),
		refetchOnWindowFocus: false,
		enabled: true,
		...queryOptions,
	} );
}
