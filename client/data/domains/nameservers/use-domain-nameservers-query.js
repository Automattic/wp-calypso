/**
 * External dependencies
 */
import { useQuery } from 'react-query';

/**
 * Internal dependencies
 */
import wp from 'calypso/lib/wp';

const useDomainNameserversQuery = ( domainName ) =>
	useQuery( [ 'domain-nameservers', domainName ], () =>
		wp.req.get( `/domains/${ domainName }/nameservers/` )
	);

export default useDomainNameserversQuery;
