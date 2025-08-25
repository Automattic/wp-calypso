import { fetchDomainSuggestions } from '@automattic/data/domains/query-functions';

export const domainSuggestionsQuery = ( query: string ) => ( {
	queryKey: [ 'domain-suggestions', query ],
	queryFn: () => fetchDomainSuggestions( query ),
	refetchOnWindowFocus: false,
	refetchOnMount: false,
} );
