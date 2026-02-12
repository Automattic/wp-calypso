import { fetchDomainDiagnostics, type DomainDiagnostics } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const domainDiagnosticsQuery = ( domainName: string ) =>
	queryOptions< DomainDiagnostics >( {
		queryKey: [ 'domains', domainName, 'diagnostics' ],
		queryFn: () => fetchDomainDiagnostics( domainName ),
	} );
