import { fetchDomainSuggestions, type DomainSuggestionQuery } from '@automattic/data';
import { queryOptions } from '@tanstack/react-query';
import { fetchDomains } from '../../data/domains';

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
