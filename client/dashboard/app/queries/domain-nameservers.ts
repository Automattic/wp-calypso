import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

const useDomainNameserversQuery = ( domainName: string ) =>
	useQuery( {
		queryKey: [ 'domain-nameservers', domainName ],
		queryFn: () => wp.req.get( `/domains/${ domainName }/nameservers/` ) as Promise< string[] >,
		refetchOnWindowFocus: false,
	} );

export default useDomainNameserversQuery;
