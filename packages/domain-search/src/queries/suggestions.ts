import { fetchDomainSuggestions } from '@automattic/data';

export const domainSuggestionsQuery = ( query: string ) => ( {
	queryKey: [ 'domain-suggestions', query ],
	queryFn: () => fetchDomainSuggestions( query ),
	refetchOnWindowFocus: false,
	refetchOnMount: false,
} );
