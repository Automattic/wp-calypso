/**
 * External dependencies
 */
import { useQuery } from 'react-query';

/**
 * Internal dependencies
 */
import wp from 'calypso/lib/wp';

const useDomainNameserversQuery = ( domainName, queryOptions = {} ) =>
	useQuery(
		[ 'domain-nameservers', domainName ],
		() => wp.req.get( `/domains/${ domainName }/nameservers` ),
		{ ...queryOptions }
	);

export default useDomainNameserversQuery;
