import { fetchDomainPropagationStatus } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const domainPropagationStatusQuery = ( domainName: string ) =>
	queryOptions( {
		queryKey: [ 'domain-propagation-status', domainName ],
		queryFn: () => fetchDomainPropagationStatus( domainName ),
		staleTime: 60 * 60 * 1000, // Consider data stale after 1 hour
	} );
