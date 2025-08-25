import { fetchDomainSuggestions } from '@automattic/data/domain-suggestions/query-functions';

export const domainSuggestionsQuery = ( query: string ) => ( {
	queryKey: [ 'domain-suggestions', query ],
	queryFn: () => fetchDomainSuggestions( query ),
	refetchOnWindowFocus: false,
	refetchOnMount: false,
} );
