import { fetchDomainSuggestions } from '@automattic/data';
import { queryOptions } from '@tanstack/react-query';
import { fetchDomains } from '../../data/domains';

export const domainsQuery = () =>
	queryOptions( {
		queryKey: [ 'domains' ],
		queryFn: fetchDomains,
	} );

export const domainSuggestionsQuery = (
	...parameters: Parameters< typeof fetchDomainSuggestions >
) =>
	queryOptions( {
		queryKey: [ 'domain-suggestions', ...parameters ],
		queryFn: () => fetchDomainSuggestions( ...parameters ),
	} );
