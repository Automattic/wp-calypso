import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

const useDomainNameserversQuery = ( domainName ) =>
	useQuery( {
		queryKey: [ 'domain-nameservers', domainName ],
		queryFn: () => wp.req.get( `/domains/${ domainName }/nameservers/` ),
		refetchOnWindowFocus: false,
	} );

export default useDomainNameserversQuery;
