import {
	type DomainSuggestionQuery,
	fetchDomainSuggestions,
	fetchFreeDomainSuggestion,
} from '@automattic/data';
import { queryOptions } from '@tanstack/react-query';

export const domainSuggestionsQuery = (
	query: string,
	params: Partial< DomainSuggestionQuery > = {}
) =>
	queryOptions( {
		queryKey: [ 'domain-suggestions', query, params ],
		queryFn: () => fetchDomainSuggestions( query, params ),
		refetchOnWindowFocus: false,
		refetchOnMount: false,
	} );

export const freeSuggestionQuery = ( query: string ) =>
	queryOptions( {
		queryKey: [ 'free-suggestion', query ],
		queryFn: () => fetchFreeDomainSuggestion( query ),
	} );
