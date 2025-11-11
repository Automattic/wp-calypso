import { fetchDomainPropagationStatus } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const domainPropagationStatusQuery = ( domainName: string ) =>
	queryOptions( {
		queryKey: [ 'domain-propagation-status', domainName ],
		queryFn: () => fetchDomainPropagationStatus( domainName ),
	} );
