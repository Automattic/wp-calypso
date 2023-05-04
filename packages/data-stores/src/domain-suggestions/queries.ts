import { useQuery } from '@tanstack/react-query';
import { stringify } from 'qs';
import wpcomProxyRequest from 'wpcom-proxy-request';
import { getFormattedPrice, normalizeDomainSuggestionQuery } from './utils';
import type { DomainSuggestion, DomainSuggestionSelectorOptions } from './types';

const STALE_TIME = 1000 * 60 * 5; // 5 minutes

export function getDomainSuggestionsQueryKey(
	search: string,
	options: DomainSuggestionSelectorOptions = {}
) {
	return [ 'domain-suggestions', search, options ];
}

export function useGetDomainSuggestions(
	search: string,
	searchOptions: DomainSuggestionSelectorOptions = {},
	queryOptions = {}
) {
	return useQuery( {
		queryKey: getDomainSuggestionsQueryKey( search, searchOptions ),
		queryFn: async () => {
			const queryObject = normalizeDomainSuggestionQuery( search, searchOptions );
			if ( ! queryObject.query ) {
				throw new Error( 'Empty query' );
			}
			const suggestions: DomainSuggestion[] = await wpcomProxyRequest( {
				apiVersion: '1.1',
				path: '/domains/suggestions',
				query: stringify( queryObject ),
			} );
			if ( ! Array.isArray( suggestions ) ) {
				throw new Error( 'Invalid response from the server' );
			}

			const processedSuggestions = suggestions.map( ( suggestion: DomainSuggestion ) => {
				if ( suggestion.unavailable ) {
					return suggestion;
				}
				return {
					...suggestion,
					...( suggestion.raw_price &&
						suggestion.currency_code && {
							cost: getFormattedPrice( suggestion.raw_price, suggestion.currency_code ),
						} ),
				};
			} );

			return processedSuggestions;
		},
		enabled: !! search,
		staleTime: STALE_TIME,
		...queryOptions,
	} );
}

/**
 * Returns the expected *.wordpress.com for a given domain name
 */
export function useGetWordPressSubdomain( domainName: string ) {
	return useGetDomainSuggestions( domainName, {
		quantity: 1,
		include_wordpressdotcom: true,
		include_dotblogsubdomain: false,
		only_wordpressdotcom: true,
		vendor: 'dot',
	} );
}
