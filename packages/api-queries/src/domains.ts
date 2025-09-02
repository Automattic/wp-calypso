import { fetchDomainSuggestions, type DomainSuggestionQuery } from '@automattic/api-core';
import { fetchDomains } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const domainsQuery = () =>
	queryOptions( {
		queryKey: [ 'domains' ],
		queryFn: fetchDomains,
	} );

export const domainSuggestionsQuery = (
	search: string,
	query: Partial< DomainSuggestionQuery > = {}
) =>
	queryOptions( {
		queryKey: [ 'domain-suggestions', search, query ],
		queryFn: () => fetchDomainSuggestions( search, query ),
	} );
