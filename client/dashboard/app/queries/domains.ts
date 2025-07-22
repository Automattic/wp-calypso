import { fetchDomains, fetchDomainSuggestions } from '../../data/domains';
import type { DomainSuggestionQuery } from '../../data/types';

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
