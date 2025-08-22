import {
	type DomainSuggestion,
	type DomainSuggestionQuery,
	fetchDomainSuggestions,
} from '@automattic/domain-search';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export type { DomainSuggestion };

const STALE_TIME = 1000 * 60 * 5; // 5 minutes

export function useDomainSuggestionsQuery(
	search?: string | null,
	searchOptions: Omit< DomainSuggestionQuery, 'query' > = {},
	queryOptions = {}
) {
	const queryClient = useQueryClient();
	const result = useQuery( {
		queryKey: [ 'domain-suggestions', search, searchOptions ],
		queryFn: async () => {
			if ( ! search ) {
				return [];
			}
			const queryObject = normalizeDomainSuggestionQuery( { query: search, ...searchOptions } );

			const suggestions = fetchDomainSuggestions( queryObject );

			if ( ! Array.isArray( suggestions ) ) {
				throw new Error( 'Invalid response from the server' );
			}

			return suggestions;
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

function normalizeDomainSuggestionQuery( {
	query,
	...queryOptions
}: Partial< DomainSuggestionQuery > ): DomainSuggestionQuery {
	return {
		// Defaults
		include_wordpressdotcom: queryOptions.only_wordpressdotcom || false,
		include_dotblogsubdomain: false,
		only_wordpressdotcom: false,
		quantity: 5,
		vendor: 'variation2_front',

		// Merge options
		...queryOptions,

		// Add the search query
		query: query?.trim().toLocaleLowerCase() ?? '',
	};
}
