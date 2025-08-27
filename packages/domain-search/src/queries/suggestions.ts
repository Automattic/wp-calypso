import { fetchDomainSuggestions } from '@automattic/data';
import { queryOptions } from '@tanstack/react-query';

export const domainSuggestionsQuery = ( query: string ) =>
	queryOptions( {
		queryKey: [ 'domain-suggestions', query ],
		queryFn: () =>
			fetchDomainSuggestions( query, {
				quantity: 30,
			} ),
		refetchOnWindowFocus: false,
		refetchOnMount: false,
	} );
