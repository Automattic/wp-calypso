import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { fetchDomains, fetchDomainSuggestions, updateDNSSEC } from '../../data/domains';
import { queryClient } from '../query-client';
import { siteDomainsQuery } from './site-domains';
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

export const updateDNSSECMutation = ( domain: string, siteId: number ) =>
	mutationOptions( {
		mutationFn: ( enabled: boolean ) => updateDNSSEC( domain, enabled ),
		onSuccess: () => {
			queryClient.invalidateQueries( siteDomainsQuery( siteId ) );
		},
	} );
