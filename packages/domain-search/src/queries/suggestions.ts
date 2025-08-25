import { fetchDomainSuggestions } from '@automattic/data/domains/queries';

export const domainSuggestionsQuery = ( query: string ) => ( {
	queryKey: [ 'domain-suggestions', query ],
	queryFn: () => fetchDomainSuggestions(),
	refetchOnWindowFocus: false,
	refetchOnMount: false,
} );
