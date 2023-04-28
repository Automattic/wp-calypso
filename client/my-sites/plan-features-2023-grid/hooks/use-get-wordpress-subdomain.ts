import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { DomainSuggestion } from '@automattic/data-stores';

export const getQueryKey = ( domainName: string ) => [ 'wordPressSubdomain', domainName ];

/**
 * Returns the expected *.wordpress.com for a given domain name
 */
export function useGetWordPressSubdomain( domainName: string ) {
	return useQuery< DomainSuggestion[], unknown, DomainSuggestion >(
		getQueryKey( domainName ),
		() =>
			wpcom.domains().suggestions( {
				query: domainName,
				quantity: 1,
				include_wordpressdotcom: true,
				include_dotblogsubdomain: false,
				only_wordpressdotcom: true,
				tld_weight_overrides: null,
				vendor: 'dot',
			} ),
		{
			enabled: !! domainName,
			select: ( data ) => {
				return data[ 0 ];
			},
			staleTime: 1000 * 60 * 5, // 5 minutes
		}
	);
}
