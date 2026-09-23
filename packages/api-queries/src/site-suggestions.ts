import { fetchFreeDomainSuggestion, fetchSiteSuggestions } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

/**
 * A free `.wordpress.com` address to prefill the site configuration form: a
 * suggested title, turned into the subdomain label that is actually available.
 *
 * Never refetched on its own — a name changing under a half-filled form would
 * be worse than a stale suggestion. Call `refetch()` for the next one.
 */
export const randomSiteNameQuery = () =>
	queryOptions( {
		queryKey: [ 'site-suggestions', 'random-site-name' ] as const,
		queryFn: async () => {
			const [ suggestion ] = await fetchSiteSuggestions();
			if ( ! suggestion ) {
				throw new Error( 'No site title suggestion to build an address from' );
			}

			const { domain_name } = await fetchFreeDomainSuggestion( suggestion.title );
			return domain_name.split( '.' )[ 0 ];
		},
		// The address may be taken by the time it is read back from storage.
		meta: { persist: false },
		staleTime: Infinity,
	} );
