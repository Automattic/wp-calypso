import { fetchDomains, fetchDomainSuggestions } from '../api/domains';
import type { DomainSuggestionQuery } from '../api/domains';

export const domainsQuery = () => ( {
	queryKey: [ 'domains' ],
	queryFn: fetchDomains,
} );

export const domainSuggestionsQuery = (
	search: string,
	domainSuggestionQuery?: Partial< DomainSuggestionQuery >
) => ( {
	queryKey: [ 'domain-suggestions', search, domainSuggestionQuery ],
	queryFn: () => fetchDomainSuggestions( search, domainSuggestionQuery ),
} );
