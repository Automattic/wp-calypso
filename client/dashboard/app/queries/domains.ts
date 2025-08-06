import { queryOptions } from '@tanstack/react-query';
import { fetchDomains, fetchDomainSuggestions } from '../../data/domains';
import type { DomainSuggestionQuery } from '../../data/types';

export const domainsQuery = () =>
	queryOptions( {
		queryKey: [ 'domains' ],
		queryFn: fetchDomains,
	} );

export const domainSuggestionsQuery = (
	search: string,
	domainSuggestionQuery?: Partial< DomainSuggestionQuery >
) =>
	queryOptions( {
		queryKey: [ 'domain-suggestions', search, domainSuggestionQuery ],
		queryFn: () => fetchDomainSuggestions( search, domainSuggestionQuery ),
	} );
