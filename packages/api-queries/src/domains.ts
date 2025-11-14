import {
	type BulkDomainsAction,
	bulkDomainsAction,
	fetchAvailableTlds,
	fetchDomainSuggestions,
	fetchFreeDomainSuggestion,
	type DomainSuggestionQuery,
} from '@automattic/api-core';
import { fetchDomains } from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

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

export const freeSuggestionQuery = (
	query: string,
	params: Partial< DomainSuggestionQuery > = {}
) =>
	queryOptions( {
		queryKey: [ 'free-suggestion', query, params ],
		queryFn: () => fetchFreeDomainSuggestion( query, params ),
	} );

export const availableTldsQuery = ( query?: string, vendor?: string ) =>
	queryOptions( {
		queryKey: [ 'available-tlds', query, vendor ],
		queryFn: () => fetchAvailableTlds( query, vendor ),
	} );

export const bulkDomainsActionMutation = () =>
	mutationOptions( {
		mutationFn: ( action: BulkDomainsAction ) => bulkDomainsAction( action ),
		onSuccess: () => {
			queryClient.invalidateQueries( {
				queryKey: domainsQuery().queryKey,
				exact: true,
			} );
		},
	} );
