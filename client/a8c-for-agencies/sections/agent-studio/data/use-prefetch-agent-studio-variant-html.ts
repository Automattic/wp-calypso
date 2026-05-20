/**
 * Keep the whole cover-variant set warm in the query cache so chevron
 * clicks feel instant.
 *
 * `useAgentStudioVariantHtml` already caches with `staleTime: Infinity`
 * (variant HTML is content-addressed by `(post_id, frame, theme)`), so
 * any URL we prefetch stays cached for the lifetime of the page and
 * back-tracking through visited variants is free.
 *
 * We prefetch every variant on first load rather than just the two
 * neighbors. The "neighbors-only" shape started one tick after the
 * live query for the current variant, so a fast chevron click would
 * still race the prefetch. Fetching the whole set in parallel — ~10
 * cheap HTTP/2 requests against a CDN-cached, immutable endpoint —
 * means once the initial sweep completes, every click in the deck is
 * instant, including wraparound.
 *
 * `prefetchQuery` is a no-op when the query is already cached, so
 * calling this with the same URL list across renders is free; the
 * React Query client dedupes by query key.
 */
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
	fetchAgentStudioVariantHtml,
	getAgentStudioVariantHtmlQueryKey,
} from './use-agent-studio-variant-html';

export default function usePrefetchAgentStudioVariantHtml( htmlUrls: ( string | undefined )[] ) {
	const queryClient = useQueryClient();
	const cacheKey = htmlUrls.join( '|' );

	useEffect( () => {
		for ( const htmlUrl of htmlUrls ) {
			if ( ! htmlUrl ) {
				continue;
			}
			queryClient.prefetchQuery( {
				queryKey: getAgentStudioVariantHtmlQueryKey( htmlUrl ),
				queryFn: () => fetchAgentStudioVariantHtml( htmlUrl ),
				staleTime: Infinity,
			} );
		}
		// `cacheKey` is a stable join of `htmlUrls`; depending on the array
		// directly would re-run the effect every render.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ cacheKey, queryClient ] );
}
