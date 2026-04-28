import { fetchReadTag, fetchReadTags, followReadTag, unfollowReadTag } from '@automattic/api-core';
import { mutationOptions, queryOptions, type QueryClient } from '@tanstack/react-query';

export const readTagsQuery = ( locale: string | null = null ) =>
	queryOptions( {
		queryKey: [ 'read', 'tags', 'followed', locale ],
		queryFn: () => fetchReadTags( locale ),
		staleTime: 1000 * 60 * 5,
	} );

export const readTagQuery = ( slug: string, locale: string | null = null ) =>
	queryOptions( {
		queryKey: [ 'read', 'tags', slug, locale ],
		queryFn: () => fetchReadTag( slug, locale ),
		enabled: !! slug,
		staleTime: 1000 * 60 * 5,
	} );

function invalidateFollowedTags( queryClient: QueryClient ): Promise< void > {
	return queryClient.invalidateQueries( { queryKey: [ 'read', 'tags', 'followed' ] } );
}

// Calypso boots its own QueryClient (see `client/state/query-client.ts`) instead
// of the singleton from this package, so each mutation factory accepts the
// caller's QueryClient and uses it for cache invalidation. Pass
// `useQueryClient()` from the consuming component.

export const followReadTagMutation = ( queryClient: QueryClient ) =>
	mutationOptions( {
		mutationFn: async ( slug: string ) => {
			try {
				return await followReadTag( slug );
			} catch ( error ) {
				// Treat "already subscribed" as a success so consumers don't show a
				// spurious error notice (matches the legacy data-layer behavior).
				if ( ( error as { error?: string } | undefined )?.error === 'already_subscribed' ) {
					return { subscribed: true, added_tag: slug, tags: [] };
				}
				throw error;
			}
		},
		onSuccess: () => invalidateFollowedTags( queryClient ),
	} );

export const unfollowReadTagMutation = ( queryClient: QueryClient ) =>
	mutationOptions( {
		mutationFn: unfollowReadTag,
		onSuccess: () => invalidateFollowedTags( queryClient ),
	} );
