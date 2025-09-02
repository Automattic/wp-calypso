import { fetchDomainAvailability } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const domainAvailabilityQuery = ( domainName: string ) =>
	queryOptions( {
		queryKey: [ 'domain-availability', domainName ],
		queryFn: () => fetchDomainAvailability( domainName ),
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		enabled: false,
	} );
