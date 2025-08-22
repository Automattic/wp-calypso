import { fetchDomainSuggestions } from './data';

export const domainSuggestionsQuery = ( query: string ) => ( {
	queryKey: [ 'domain-suggestions', query ],
	queryFn: () => fetchDomainSuggestions(),
	refetchOnWindowFocus: false,
	refetchOnMount: false,
} );
