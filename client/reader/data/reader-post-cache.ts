import { useQueries, useQuery } from '@tanstack/react-query';
import { createElement, useMemo } from 'react';
import { keyForPost, keyToString } from 'calypso/reader/post-key';
import type { QueryClient } from '@tanstack/react-query';
import type { ComponentType } from 'react';

export type ReaderPostCachePost = Record< string, unknown >;

interface ReaderPostCacheData {
	base: ReaderPostCachePost;
	overlay: ReaderPostCachePost;
}

interface ReaderPostCacheKey {
	blogId?: number | string | null;
	feedId?: number | string | null;
	postId?: number | string | null;
}

type ReaderPostCacheTarget = ReaderPostCacheKey | ReaderPostCachePost | null | undefined;

type ReaderPostCacheQueryKey = readonly [ 'read', 'post', 'cache', string ];
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

const postKeyStringFromKey = ( postKey: ReaderPostCacheKey ): string | null => {
	return keyToString( postKey );
};

const postKeyStringFromPost = ( post: ReaderPostCachePost ): string | null => {
	return keyToString( keyForPost( post ) );
};

const postKeyStringsFromPost = ( post: ReaderPostCachePost ): string[] => {
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

const isReaderPostCacheKey = ( target: ReaderPostCacheTarget ): target is ReaderPostCacheKey => {
	return (
		typeof target === 'object' &&
		target !== null &&
		( 'postId' in target || 'blogId' in target || 'feedId' in target )
	);
};

const readerPostCacheKeyString = ( target: ReaderPostCacheTarget ): string | null => {
	if ( ! target ) {
		return null;
	}
	if ( isReaderPostCacheKey( target ) ) {
		return postKeyStringFromKey( target );
	}
	return postKeyStringFromPost( target );
};

const readerPostCacheQueryKey = ( target: ReaderPostCacheTarget ): ReaderPostCacheQueryKey => {
	return [ 'read', 'post', 'cache', readerPostCacheKeyString( target ) ?? 'unknown' ] as const;
};

const readerPostCacheQueryKeyFromString = ( keyString: string ): ReaderPostCacheQueryKey => {
	return [ 'read', 'post', 'cache', keyString ] as const;
};

const mergeReaderPost = (
	base: ReaderPostCachePost | null | undefined,
	patch: ReaderPostCachePost | null | undefined
): ReaderPostCachePost => {
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
						...( ( base.discussion as ReaderPostCachePost | undefined ) ?? {} ),
						...( ( patch.discussion as ReaderPostCachePost | undefined ) ?? {} ),
					},
			  }
			: {} ),
	};
};

const mergeReaderPostCacheData = (
	data: ReaderPostCacheData | null | undefined
): ReaderPostCachePost | null => {
	if ( ! data ) {
		return null;
	}
	return mergeReaderPost( data.base, data.overlay );
};

const ensureReaderPostCacheQueryDefaults = ( queryClient: QueryClient ) => {
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

const postMatchesKey = ( post: ReaderPostCachePost, key: ReaderPostCacheKey ): boolean => {
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

const postsShareIdentity = ( left: ReaderPostCachePost, right: ReaderPostCachePost ): boolean => {
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

const cacheEntryMatchesTarget = (
	post: ReaderPostCachePost,
	target: ReaderPostCacheTarget
): boolean => {
	if ( ! target ) {
		return false;
	}
	if ( isReaderPostCacheKey( target ) ) {
		return postMatchesKey( post, target );
	}
	return postsShareIdentity( post, target );
};

const getMatchingCacheKeyStrings = (
	queryClient: QueryClient,
	target: ReaderPostCacheTarget
): string[] => {
	const matchingKeyStrings = new Set< string >();
	const targetKeyString = readerPostCacheKeyString( target );
	const targetQueryData = targetKeyString
		? queryClient.getQueryData< ReaderPostCacheData >(
				readerPostCacheQueryKeyFromString( targetKeyString )
		  )
		: null;

	if ( targetQueryData ) {
		matchingKeyStrings.add( targetKeyString as string );
	}

	const cacheQueries = queryClient.getQueriesData< ReaderPostCacheData >( {
		queryKey: READER_POST_CACHE_QUERY_KEY_PREFIX,
	} );

	for ( const [ queryKey, current ] of cacheQueries ) {
		const merged = mergeReaderPostCacheData( current );
		const keyString = ( queryKey as ReaderPostCacheQueryKey )[ 3 ];
		if ( merged && keyString && cacheEntryMatchesTarget( merged, target ) ) {
			matchingKeyStrings.add( keyString );
		}
	}

	return [ ...matchingKeyStrings ];
};

export const upsertReaderPostCache = (
	queryClient: QueryClient,
	posts: Array< ReaderPostCachePost | null | undefined >
) => {
	ensureReaderPostCacheQueryDefaults( queryClient );

	const validPosts = posts.filter( Boolean ) as ReaderPostCachePost[];
	const keyStringsByPost = new Map(
		validPosts.map( ( post ) => [ post, new Set( postKeyStringsFromPost( post ) ) ] )
	);
	const cacheQueries = queryClient.getQueriesData< ReaderPostCacheData >( {
		queryKey: READER_POST_CACHE_QUERY_KEY_PREFIX,
	} );

	for ( const [ queryKey, current ] of cacheQueries ) {
		const merged = mergeReaderPostCacheData( current );
		const keyString = ( queryKey as ReaderPostCacheQueryKey )[ 3 ];
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
			queryClient.setQueryData< ReaderPostCacheData >(
				readerPostCacheQueryKeyFromString( keyString ),
				( current ) => ( {
					base: mergeReaderPost( current?.base, post ),
					overlay: current?.overlay ?? {},
				} )
			);
		} );
	} );
};

export const getCachedReaderPost = (
	queryClient: QueryClient,
	target: ReaderPostCacheTarget
): ReaderPostCachePost | null => {
	const keyString = readerPostCacheKeyString( target );
	if ( ! keyString ) {
		return null;
	}
	return (
		mergeReaderPostCacheData(
			queryClient.getQueryData< ReaderPostCacheData >( readerPostCacheQueryKey( target ) )
		) ?? null
	);
};

export const updateCachedReaderPost = (
	queryClient: QueryClient,
	target: ReaderPostCacheTarget,
	patch: ( post: ReaderPostCachePost | null ) => ReaderPostCachePost
) => {
	ensureReaderPostCacheQueryDefaults( queryClient );

	getMatchingCacheKeyStrings( queryClient, target ).forEach( ( keyString ) => {
		queryClient.setQueryData< ReaderPostCacheData >(
			readerPostCacheQueryKeyFromString( keyString ),
			( current ) => {
				const merged = mergeReaderPostCacheData( current );
				if ( ! current || ! merged ) {
					return current;
				}
				const nextPatch = patch( merged );
				return {
					base: current.base,
					overlay: mergeReaderPost( current.overlay, nextPatch ),
				};
			}
		);
	} );
};

export const updateCachedReaderPostsMatching = (
	queryClient: QueryClient,
	predicate: ( post: ReaderPostCachePost ) => boolean,
	patch: ( post: ReaderPostCachePost ) => ReaderPostCachePost
) => {
	ensureReaderPostCacheQueryDefaults( queryClient );

	const cacheQueries = queryClient.getQueriesData< ReaderPostCacheData >( {
		queryKey: READER_POST_CACHE_QUERY_KEY_PREFIX,
	} );

	for ( const [ queryKey, current ] of cacheQueries ) {
		const merged = mergeReaderPostCacheData( current );
		if ( ! merged || ! predicate( merged ) ) {
			continue;
		}

		queryClient.setQueryData< ReaderPostCacheData >( queryKey, {
			base: current?.base ?? {},
			overlay: mergeReaderPost( current?.overlay, patch( merged ) ),
		} );
	}
};

export const useCachedReaderPost = (
	target: ReaderPostCacheTarget
): ReaderPostCachePost | null => {
	// Cache-only read. UI that can fetch missing posts should use useReaderPost instead.
	const query = useQuery< ReaderPostCacheData | null >( {
		queryKey: readerPostCacheQueryKey( target ),
		queryFn: () => Promise.resolve( null ),
		enabled: false,
		...READER_POST_CACHE_QUERY_OPTIONS,
	} );

	return useMemo( () => mergeReaderPostCacheData( query.data ), [ query.data ] );
};

export const useCachedReaderPosts = (
	targets: ReaderPostCacheTarget[]
): Array< ReaderPostCachePost | null > => {
	const queries = useQueries( {
		queries: targets.map( ( target ) => ( {
			queryKey: readerPostCacheQueryKey( target ),
			queryFn: () => Promise.resolve( null ),
			enabled: false,
			...READER_POST_CACHE_QUERY_OPTIONS,
		} ) ),
	} );

	return useMemo(
		() =>
			queries.map( ( query ) =>
				mergeReaderPostCacheData( query.data as ReaderPostCacheData | null | undefined )
			),
		[ queries ]
	);
};

interface WithCachedReaderPostProps {
	post?: ReaderPostCachePost | null;
}

export const withCachedReaderPost =
	< Props extends WithCachedReaderPostProps >(
		getTarget: ( props: Props ) => ReaderPostCacheTarget
	) =>
	( WrappedComponent: ComponentType< Props > ) => {
		const CachedReaderPostContainer = ( props: Props ) => {
			const canonicalPost = useCachedReaderPost( getTarget( props ) );
			const nextProps = {
				...props,
				post: props.post ?? canonicalPost,
			} as Props;

			return createElement( WrappedComponent, nextProps );
		};

		CachedReaderPostContainer.displayName = `withCachedReaderPost(${
			WrappedComponent.displayName || WrappedComponent.name || 'Component'
		})`;

		return CachedReaderPostContainer;
	};
