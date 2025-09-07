import { fetchDomainAvailability } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const domainAvailabilityQuery = ( domainName: string, enabled = true ) =>
	queryOptions( {
		queryKey: [ 'domain-availability', domainName ],
		queryFn: () => fetchDomainAvailability( domainName ),
		meta: { persist: false },
		enabled,
	} );
