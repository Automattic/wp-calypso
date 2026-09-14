/**
 * Warm the variant-HTML cache so chevron clicks feel instant.
 * `prefetchQuery` is a no-op when the entry is already cached.
 */
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
	fetchAgentStudioVariantHtml,
	getAgentStudioVariantHtmlQueryKey,
} from './use-agent-studio-variant-html';

// Safety ceiling — the recipe's `frame_count` default is 10; this
// keeps the prefetch bounded if it ever balloons.
const MAX_PREFETCH = 12;

export default function usePrefetchAgentStudioVariantHtml( htmlUrls: ( string | undefined )[] ) {
	const queryClient = useQueryClient();
	const urls = htmlUrls.slice( 0, MAX_PREFETCH );
	const cacheKey = urls.join( '\x00' );

	useEffect( () => {
		for ( const htmlUrl of urls ) {
			if ( ! htmlUrl ) {
				continue;
			}
			queryClient.prefetchQuery( {
				queryKey: getAgentStudioVariantHtmlQueryKey( htmlUrl ),
				queryFn: () => fetchAgentStudioVariantHtml( htmlUrl ),
				staleTime: Infinity,
			} );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ cacheKey, queryClient ] );
}
