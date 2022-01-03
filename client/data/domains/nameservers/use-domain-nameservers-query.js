import { useQuery } from 'react-query';
import wp from 'calypso/lib/wp';

const useDomainNameserversQuery = ( domainName ) =>
	useQuery(
		[ 'domain-nameservers', domainName ],
		() => wp.req.get( `/domains/${ domainName }/nameservers/` ),
		{ refetchOnWindowFocus: false }
	);

export default useDomainNameserversQuery;
