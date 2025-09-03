import {
	fetchDomainSuggestions,
	fetchFreeDomainSuggestion,
	type DomainSuggestionQuery,
} from '@automattic/api-core';
import { fetchDomains } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const domainsQuery = () =>
	queryOptions( {
		queryKey: [ 'domains' ],
		queryFn: fetchDomains,
	} );

export const domainSuggestionsQuery = (
	query: string,
	params: Partial< DomainSuggestionQuery > = {}
) =>
	queryOptions( {
		queryKey: [ 'domain-suggestions', query, params ],
		queryFn: () => fetchDomainSuggestions( query, params ),
		meta: { persist: false },
	} );

export const freeSuggestionQuery = ( query: string ) =>
	queryOptions( {
		queryKey: [ 'free-suggestion', query ],
		queryFn: () => fetchFreeDomainSuggestion( query ),
	} );
