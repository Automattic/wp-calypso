import { useQueries, useQuery } from '@tanstack/react-query';
import { createElement, useMemo } from 'react';
import { keyForPost, keyToString } from 'calypso/reader/post-key';
import type { ReadPost as ApiPost } from '@automattic/api-core';
import type { QueryClient } from '@tanstack/react-query';
import type { ComponentType } from 'react';

export type Post = Partial< ApiPost > & Record< string, unknown >;

interface PostCacheData {
	base: Post;
	overlay: Post;
}

interface PostCacheKey {
	blogId?: number | string | null;
	feedId?: number | string | null;
	postId?: number | string | null;
}

type PostCacheTarget = PostCacheKey | Post | null | undefined;

type PostCacheQueryKey = readonly [ 'read', 'post', 'cache', string ];
const READER_POST_CACHE_QUERY_KEY_PREFIX = [ 'read', 'post', 'cache' ] as const;
const READER_POST_CACHE_QUERY_OPTIONS = {
	staleTime: Infinity,
	meta: { persist: false },
} as const;

const valueToString = ( value: unknown ): string | null => {
	if ( value === undefined || value === null || value === '' ) {
		return null;
	}
	return String( value );
};

const postKeyStringFromKey = ( postKey: PostCacheKey ): string | null => {
	return keyToString( postKey );
};

const postKeyStringFromPost = ( post: Post ): string | null => {
	return keyToString( keyForPost( post ) );
};

const postKeyStringsFromPost = ( post: Post ): string[] => {
	const keyStrings = new Set< string >();
	const siteId = valueToString( post.site_ID );
	const postId = valueToString( post.ID );
	const feedId = valueToString( post.feed_ID );
	const feedItemId = valueToString( post.feed_item_ID );
	const feedItemIds = Array.isArray( post.feed_item_IDs )
		? post.feed_item_IDs.map( valueToString ).filter( Boolean )
		: [];

	if ( feedId && feedItemId ) {
		keyStrings.add( `feed-${ feedItemId }-${ feedId }` );
	}
	if ( feedId ) {
		feedItemIds.forEach( ( currentFeedItemId ) => {
			keyStrings.add( `feed-${ currentFeedItemId }-${ feedId }` );
		} );
	}

	if ( Boolean( post.is_external ) && postId ) {
		const externalFeedId = feedId ?? siteId;
		if ( externalFeedId ) {
			keyStrings.add( `feed-${ postId }-${ externalFeedId }` );
		}
	}

	if ( siteId && postId && ! post.is_external ) {
		keyStrings.add( `blog-${ postId }-${ siteId }` );
	}

	return [ ...keyStrings ];
};

const isPostCacheKey = ( target: PostCacheTarget ): target is PostCacheKey => {
	return (
		typeof target === 'object' &&
		target !== null &&
		( 'postId' in target || 'blogId' in target || 'feedId' in target )
	);
};

const postCacheKeyString = ( target: PostCacheTarget ): string | null => {
	if ( ! target ) {
		return null;
	}
	if ( isPostCacheKey( target ) ) {
		return postKeyStringFromKey( target );
	}
	return postKeyStringFromPost( target );
};

const postCacheQueryKey = ( target: PostCacheTarget ): PostCacheQueryKey => {
	return [ 'read', 'post', 'cache', postCacheKeyString( target ) ?? 'unknown' ] as const;
};

const postCacheQueryKeyFromString = ( keyString: string ): PostCacheQueryKey => {
	return [ 'read', 'post', 'cache', keyString ] as const;
};

const mergePost = ( base: Post | null | undefined, patch: Post | null | undefined ): Post => {
	if ( ! base ) {
		return { ...( patch ?? {} ) };
	}
	if ( ! patch ) {
		return { ...base };
	}
	return {
		...base,
		...patch,
		...( base.discussion || patch.discussion
			? {
					discussion: {
						...( ( base.discussion as Post | undefined ) ?? {} ),
						...( ( patch.discussion as Post | undefined ) ?? {} ),
					},
			  }
			: {} ),
	};
};

const mergePostCacheData = ( data: PostCacheData | null | undefined ): Post | null => {
	if ( ! data ) {
		return null;
	}
	return mergePost( data.base, data.overlay );
};

const ensurePostCacheQueryDefaults = ( queryClient: QueryClient ) => {
	queryClient.setQueryDefaults(
		READER_POST_CACHE_QUERY_KEY_PREFIX,
		READER_POST_CACHE_QUERY_OPTIONS
	);
};

const valuesMatch = ( left: unknown, right: unknown ): boolean => {
	const leftString = valueToString( left );
	const rightString = valueToString( right );
	return Boolean( leftString && rightString && leftString === rightString );
};

const arrayIncludesMatchingValue = ( values: unknown, target: unknown ): boolean => {
	return Array.isArray( values ) && values.some( ( value ) => valuesMatch( value, target ) );
};

const arraysShareMatchingValue = ( left: unknown, right: unknown ): boolean => {
	return (
		Array.isArray( left ) &&
		Array.isArray( right ) &&
		left.some( ( leftValue ) =>
			right.some( ( rightValue ) => valuesMatch( leftValue, rightValue ) )
		)
	);
};

const postMatchesKey = ( post: Post, key: PostCacheKey ): boolean => {
	if ( key.blogId && key.postId ) {
		return valuesMatch( post.site_ID, key.blogId ) && valuesMatch( post.ID, key.postId );
	}

	if ( key.feedId && key.postId ) {
		if ( ! valuesMatch( post.feed_ID, key.feedId ) ) {
			return false;
		}

		if ( valuesMatch( post.feed_item_ID, key.postId ) ) {
			return true;
		}

		return arrayIncludesMatchingValue( post.feed_item_IDs, key.postId );
	}

	return false;
};

const postsShareIdentity = ( left: Post, right: Post ): boolean => {
	if ( valuesMatch( left.global_ID, right.global_ID ) ) {
		return true;
	}
	if ( valuesMatch( left.site_ID, right.site_ID ) && valuesMatch( left.ID, right.ID ) ) {
		return true;
	}
	if (
		valuesMatch( left.feed_ID, right.feed_ID ) &&
		( valuesMatch( left.feed_item_ID, right.feed_item_ID ) ||
			arrayIncludesMatchingValue( left.feed_item_IDs, right.feed_item_ID ) ||
			arrayIncludesMatchingValue( right.feed_item_IDs, left.feed_item_ID ) ||
			arraysShareMatchingValue( left.feed_item_IDs, right.feed_item_IDs ) )
	) {
		return true;
	}

	return false;
};

const cacheEntryMatchesTarget = ( post: Post, target: PostCacheTarget ): boolean => {
	if ( ! target ) {
		return false;
	}
	if ( isPostCacheKey( target ) ) {
		return postMatchesKey( post, target );
	}
	return postsShareIdentity( post, target );
};

const getMatchingCacheKeyStrings = (
	queryClient: QueryClient,
	target: PostCacheTarget
): string[] => {
	const matchingKeyStrings = new Set< string >();
	const targetKeyString = postCacheKeyString( target );
	const targetQueryData = targetKeyString
		? queryClient.getQueryData< PostCacheData >( postCacheQueryKeyFromString( targetKeyString ) )
		: null;

	if ( targetQueryData ) {
		matchingKeyStrings.add( targetKeyString as string );
	}

	const cacheQueries = queryClient.getQueriesData< PostCacheData >( {
		queryKey: READER_POST_CACHE_QUERY_KEY_PREFIX,
	} );

	for ( const [ queryKey, current ] of cacheQueries ) {
		const merged = mergePostCacheData( current );
		const keyString = ( queryKey as PostCacheQueryKey )[ 3 ];
		if ( merged && keyString && cacheEntryMatchesTarget( merged, target ) ) {
			matchingKeyStrings.add( keyString );
		}
	}

	return [ ...matchingKeyStrings ];
};

export const upsertPostCache = (
	queryClient: QueryClient,
	posts: Array< Post | null | undefined >
) => {
	ensurePostCacheQueryDefaults( queryClient );

	const validPosts = posts.filter( Boolean ) as Post[];
	const keyStringsByPost = new Map(
		validPosts.map( ( post ) => [ post, new Set( postKeyStringsFromPost( post ) ) ] )
	);
	const cacheQueries = queryClient.getQueriesData< PostCacheData >( {
		queryKey: READER_POST_CACHE_QUERY_KEY_PREFIX,
	} );

	for ( const [ queryKey, current ] of cacheQueries ) {
		const merged = mergePostCacheData( current );
		const keyString = ( queryKey as PostCacheQueryKey )[ 3 ];
		if ( ! merged || ! keyString ) {
			continue;
		}

		validPosts.forEach( ( post ) => {
			if ( cacheEntryMatchesTarget( merged, post ) ) {
				keyStringsByPost.get( post )?.add( keyString );
			}
		} );
	}

	validPosts.forEach( ( post ) => {
		keyStringsByPost.get( post )?.forEach( ( keyString ) => {
			queryClient.setQueryData< PostCacheData >(
				postCacheQueryKeyFromString( keyString ),
				( current ) => ( {
					base: mergePost( current?.base, post ),
					overlay: current?.overlay ?? {},
				} )
			);
		} );
	} );
};

export const getCachedPost = ( queryClient: QueryClient, target: PostCacheTarget ): Post | null => {
	const keyString = postCacheKeyString( target );
	if ( ! keyString ) {
		return null;
	}
	return (
		mergePostCacheData(
			queryClient.getQueryData< PostCacheData >( postCacheQueryKey( target ) )
		) ?? null
	);
};

export const updateCachedPost = (
	queryClient: QueryClient,
	target: PostCacheTarget,
	patch: ( post: Post | null ) => Post
) => {
	ensurePostCacheQueryDefaults( queryClient );

	getMatchingCacheKeyStrings( queryClient, target ).forEach( ( keyString ) => {
		queryClient.setQueryData< PostCacheData >(
			postCacheQueryKeyFromString( keyString ),
			( current ) => {
				const merged = mergePostCacheData( current );
				if ( ! current || ! merged ) {
					return current;
				}
				const nextPatch = patch( merged );
				return {
					base: current.base,
					overlay: mergePost( current.overlay, nextPatch ),
				};
			}
		);
	} );
};

export const updateCachedPostsMatching = (
	queryClient: QueryClient,
	predicate: ( post: Post ) => boolean,
	patch: ( post: Post ) => Post
) => {
	ensurePostCacheQueryDefaults( queryClient );

	const cacheQueries = queryClient.getQueriesData< PostCacheData >( {
		queryKey: READER_POST_CACHE_QUERY_KEY_PREFIX,
	} );

	for ( const [ queryKey, current ] of cacheQueries ) {
		const merged = mergePostCacheData( current );
		if ( ! merged || ! predicate( merged ) ) {
			continue;
		}

		queryClient.setQueryData< PostCacheData >( queryKey, {
			base: current?.base ?? {},
			overlay: mergePost( current?.overlay, patch( merged ) ),
		} );
	}
};

export const useCachedPost = ( target: PostCacheTarget ): Post | null => {
	// Cache-only read. UI that can fetch missing posts should use usePost instead.
	const query = useQuery< PostCacheData | null >( {
		queryKey: postCacheQueryKey( target ),
		queryFn: () => Promise.resolve( null ),
		enabled: false,
		...READER_POST_CACHE_QUERY_OPTIONS,
	} );

	return useMemo( () => mergePostCacheData( query.data ), [ query.data ] );
};

export const useCachedPosts = ( targets: PostCacheTarget[] ): Array< Post | null > => {
	const queries = useQueries( {
		queries: targets.map( ( target ) => ( {
			queryKey: postCacheQueryKey( target ),
			queryFn: () => Promise.resolve( null ),
			enabled: false,
			...READER_POST_CACHE_QUERY_OPTIONS,
		} ) ),
	} );

	return useMemo(
		() =>
			queries.map( ( query ) =>
				mergePostCacheData( query.data as PostCacheData | null | undefined )
			),
		[ queries ]
	);
};

interface WithCachedPostProps {
	post?: Post | null;
}

export const withCachedPost =
	< Props extends WithCachedPostProps >( getTarget: ( props: Props ) => PostCacheTarget ) =>
	( WrappedComponent: ComponentType< Props > ) => {
		const CachedPostContainer = ( props: Props ) => {
			const cachedPost = useCachedPost( getTarget( props ) );
			const nextProps = {
				...props,
				post: props.post ?? cachedPost,
			} as Props;

			return createElement( WrappedComponent, nextProps );
		};

		CachedPostContainer.displayName = `withCachedPost(${
			WrappedComponent.displayName || WrappedComponent.name || 'Component'
		})`;

		return CachedPostContainer;
	};
