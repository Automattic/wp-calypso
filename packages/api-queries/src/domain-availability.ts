import { type DomainAvailabilityQuery, fetchDomainAvailability } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const domainAvailabilityQuery = (
	domainName: string,
	params: Partial< DomainAvailabilityQuery > = {}
) =>
	queryOptions( {
		queryKey: [ 'domain-availability', domainName, params ],
		queryFn: () => fetchDomainAvailability( domainName, params ),
		meta: { persist: false },
	} );
