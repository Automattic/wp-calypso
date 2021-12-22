import { useQuery } from 'react-query';
import wp from 'calypso/lib/wp';

const useDomainNameserversQuery = ( domainName, enabled ) =>
	useQuery(
		[ 'domain-nameservers', domainName ],
		() => wp.req.get( `/domains/${ domainName }/nameservers/` ),
		{ enabled, refetchOnWindowFocus: false }
	);

export default useDomainNameserversQuery;
