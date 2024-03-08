import { useQuery, useQueryClient } from '@tanstack/react-query';
import { stringify } from 'qs';
import wpcomProxyRequest from 'wpcom-proxy-request';
import { getFormattedPrice, normalizeDomainSuggestionQuery } from './utils';
import type { DomainSuggestion, DomainSuggestionSelectorOptions } from './types';

const STALE_TIME = 1000 * 60 * 5; // 5 minutes

export function useGetDomainSuggestions(
	search?: string | null,
	searchOptions: DomainSuggestionSelectorOptions = {},
	queryOptions = {}
) {
	const queryClient = useQueryClient();
	const result = useQuery( {
		queryKey: [ 'domain-suggestions', search, searchOptions ],
		queryFn: async () => {
			if ( ! search ) {
				return [];
			}
			const queryObject = normalizeDomainSuggestionQuery( search, searchOptions );

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

	return {
		...result,
		invalidateCache: () =>
			queryClient.invalidateQueries( {
				queryKey: [ 'domain-suggestions', search, searchOptions ],
			} ),
	};
}

/**
 * Returns the expected *.wordpress.com for a given domain name
 */
export function useGetWordPressSubdomain( paidDomainName?: string | null ) {
	return useGetDomainSuggestions( paidDomainName, {
		quantity: 1,
		include_wordpressdotcom: true,
		include_dotblogsubdomain: false,
		only_wordpressdotcom: false,
		vendor: 'dot',
	} );
}

/**
 * Returns a custom .com domain suggestion for a given query
 */
export function useGetSingleCustomDotComDomainSuggestion( query?: string | null, locale?: string ) {
	return useGetDomainSuggestions( query, {
		quantity: 1,
		include_wordpressdotcom: false,
		include_dotblogsubdomain: false,
		locale,
		tlds: [ 'com' ],
	} );
}
