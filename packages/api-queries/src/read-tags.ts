import {
	fetchReadTag,
	fetchReadTags,
	followReadTag,
	unfollowReadTag,
	type ReadSingleTagResponse,
	type ReadTag,
	type ReadTagsResponse,
} from '@automattic/api-core';
import {
	mutationOptions,
	queryOptions,
	type QueryClient,
	type QueryKey,
} from '@tanstack/react-query';
import { decodeEntities } from '@wordpress/html-entities';

export interface ReaderTag {
	id: string;
	slug: string;
	title: string;
	displayName: string;
	url: string;
	description?: string;
	isFollowing?: boolean;
}

function normalizeTag( tag: ReadTag ): ReaderTag {
	return {
		id: String( tag.ID ),
		slug: tag.slug.toLowerCase(),
		title: decodeEntities( tag.title ),
		displayName: decodeEntities( tag.title || tag.display_name ),
		url: `/tag/${ tag.slug }`,
		description: tag.description ? decodeEntities( tag.description ) : undefined,
	};
}

function normalizeTagsResponse( response: ReadTagsResponse | ReadSingleTagResponse ): ReaderTag[] {
	const single = ( response as ReadSingleTagResponse ).tag;
	const list = ( response as ReadTagsResponse ).tags;
	const tags = [ single, ...( list ?? [] ) ].filter( Boolean ) as ReadTag[];
	return tags.map( normalizeTag );
}

export const readTagsQuery = ( locale: string | null = null ) =>
	queryOptions( {
		queryKey: [ 'read', 'tags', 'followed', locale ],
		queryFn: () => fetchReadTags( locale ),
		select: ( data ): ReaderTag[] =>
			normalizeTagsResponse( data )
				.map( ( tag ) => ( { ...tag, isFollowing: true } ) )
				.sort( ( a, b ) => a.slug.localeCompare( b.slug ) ),
		staleTime: 1000 * 60 * 5,
	} );

export const readTagQuery = ( slug: string, locale: string | null = null ) =>
	queryOptions( {
		queryKey: [ 'read', 'tags', slug, locale ],
		queryFn: () => fetchReadTag( slug, locale ),
		select: ( data ): ReaderTag | null => normalizeTagsResponse( data )[ 0 ] ?? null,
		enabled: !! slug,
		staleTime: 1000 * 60 * 5,
	} );

function invalidateFollowedTags( queryClient: QueryClient ): Promise< void > {
	return queryClient.invalidateQueries( { queryKey: [ 'read', 'tags', 'followed' ] } );
}

/**
 * Turn a tag name into its API slug. Consumers can pass either a raw label
 * ("Health & Fitness") or an already-canonical slug ("health-fitness") — both
 * normalize to the same value. URL-encoding is left to the api-core layer.
 */
function slugify( tag: string ): string {
	return typeof tag === 'string'
		? tag.trim().toLowerCase().replace( /\s+/g, '-' ).replace( /-{2,}/g, '-' )
		: '';
}

// Calypso boots its own QueryClient (see `client/state/query-client.ts`) instead
// of the singleton from this package, so each mutation factory accepts the
// caller's QueryClient and uses it for cache invalidation. Pass
// `useQueryClient()` from the consuming component.

interface FollowedTagsMutationContext {
	previous: Array< [ QueryKey, ReadTagsResponse | undefined ] >;
}

// Optimistically patch the followed-tags cache so the follow/unfollow button
// flips on click instead of waiting for the POST + refetch round-trip. The cache
// holds the raw response ({ tags: ReadTag[] }); `select` normalizes on read, so
// we patch the raw shape here. `onSettled` invalidation reconciles with the
// server afterwards.
async function snapshotAndPatchFollowedTags(
	queryClient: QueryClient,
	updater: ( tags: ReadTag[] ) => ReadTag[]
): Promise< FollowedTagsMutationContext > {
	try {
		await queryClient.cancelQueries( { queryKey: [ 'read', 'tags', 'followed' ] } );
	} catch {
		// cancelQueries is best-effort; the optimistic patch below must still run.
	}
	const previous = queryClient.getQueriesData< ReadTagsResponse >( {
		queryKey: [ 'read', 'tags', 'followed' ],
	} );
	queryClient.setQueriesData< ReadTagsResponse >(
		{ queryKey: [ 'read', 'tags', 'followed' ] },
		( old ) => ( old?.tags ? { ...old, tags: updater( old.tags ) } : old )
	);
	return { previous };
}

function rollbackFollowedTags(
	queryClient: QueryClient,
	context: FollowedTagsMutationContext | undefined
) {
	context?.previous.forEach( ( [ key, data ] ) => queryClient.setQueryData( key, data ) );
}

// Source a full ReadTag for the optimistic follow from the single-tag cache when
// available; the reconciling refetch replaces the minimal fallback with real data.
function findCachedReadTag( queryClient: QueryClient, slug: string ): ReadTag | undefined {
	const matches = queryClient.getQueriesData< ReadSingleTagResponse >( {
		queryKey: [ 'read', 'tags', slug ],
	} );
	for ( const [ , data ] of matches ) {
		if ( data?.tag ) {
			return data.tag;
		}
	}
	return undefined;
}

export const followReadTagMutation = ( queryClient: QueryClient ) =>
	mutationOptions( {
		meta: { statId: 'read-tag-follow' },
		mutationFn: async ( tag: string ) => {
			const slug = slugify( tag );
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
		onMutate: ( tag: string ) => {
			const slug = slugify( tag );
			const optimisticTag: ReadTag = findCachedReadTag( queryClient, slug ) ?? {
				ID: slug,
				slug,
				title: tag,
				display_name: tag,
				URL: `/tag/${ slug }`,
			};
			return snapshotAndPatchFollowedTags( queryClient, ( tags ) =>
				tags.some( ( t ) => t.slug.toLowerCase() === slug ) ? tags : [ ...tags, optimisticTag ]
			);
		},
		onError: ( _error, _tag, context ) => rollbackFollowedTags( queryClient, context ),
		onSettled: () => invalidateFollowedTags( queryClient ),
	} );

export const unfollowReadTagMutation = ( queryClient: QueryClient ) =>
	mutationOptions( {
		meta: { statId: 'read-tag-unfollow' },
		mutationFn: ( tag: string ) => unfollowReadTag( slugify( tag ) ),
		onMutate: ( tag: string ) => {
			const slug = slugify( tag );
			return snapshotAndPatchFollowedTags( queryClient, ( tags ) =>
				tags.filter( ( t ) => t.slug.toLowerCase() !== slug )
			);
		},
		onError: ( _error, _tag, context ) => rollbackFollowedTags( queryClient, context ),
		onSettled: () => invalidateFollowedTags( queryClient ),
	} );
