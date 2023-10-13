import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

const useDomainNameserversQuery = ( domainName ) =>
	useQuery( {
		queryKey: [ 'domain-nameservers', domainName ],
		queryFn: async () => {
			const response = await wp.req.get( `/domains/${ domainName }/nameservers/` );
			console.log( { response: response } );
			return response;
		},
		refetchOnWindowFocus: false,
	} );

export default useDomainNameserversQuery;
