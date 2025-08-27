import { fetchDomainAvailability } from '@automattic/data';

export const domainAvailabilityQuery = ( domainName: string ) => ( {
	queryKey: [ 'domain-availability', domainName ],
	queryFn: () => fetchDomainAvailability( domainName ),
	refetchOnWindowFocus: false,
	refetchOnMount: false,
} );
