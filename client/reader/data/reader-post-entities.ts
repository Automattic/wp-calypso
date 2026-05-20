import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { keyForPost, keyToString } from 'calypso/reader/post-key';
import type { QueryClient } from '@tanstack/react-query';

export type ReaderPostEntityPost = Record< string, unknown >;

interface ReaderPostEntityData {
	base: ReaderPostEntityPost;
	overlay: ReaderPostEntityPost;
}

interface ReaderPostEntityKey {
	blogId?: number | string | null;
	feedId?: number | string | null;
	postId?: number | string | null;
}

type ReaderPostEntityTarget = ReaderPostEntityKey | ReaderPostEntityPost | null | undefined;

type ReaderPostEntityQueryKey = readonly [ 'read', 'post', 'entity', string ];
const READER_POST_ENTITY_QUERY_KEY_PREFIX = [ 'read', 'post', 'entity' ] as const;
const READER_POST_ENTITY_QUERY_OPTIONS = {
	staleTime: Infinity,
	meta: { persist: false },
} as const;

const valueToString = ( value: unknown ): string | null => {
	if ( value === undefined || value === null || value === '' ) {
		return null;
	}
	return String( value );
};

const postKeyStringFromKey = ( postKey: ReaderPostEntityKey ): string | null => {
	return keyToString( postKey );
};

const postKeyStringFromPost = ( post: ReaderPostEntityPost ): string | null => {
	return keyToString( keyForPost( post ) );
};

const postKeyStringsFromPost = ( post: ReaderPostEntityPost ): string[] => {
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

const isReaderPostEntityKey = ( target: ReaderPostEntityTarget ): target is ReaderPostEntityKey => {
	return (
		typeof target === 'object' &&
		target !== null &&
		( 'postId' in target || 'blogId' in target || 'feedId' in target )
	);
};

const readerPostEntityKeyString = ( target: ReaderPostEntityTarget ): string | null => {
	if ( ! target ) {
		return null;
	}
	if ( isReaderPostEntityKey( target ) ) {
		return postKeyStringFromKey( target );
	}
	return postKeyStringFromPost( target );
};

const readerPostEntityQueryKey = ( target: ReaderPostEntityTarget ): ReaderPostEntityQueryKey => {
	return [ 'read', 'post', 'entity', readerPostEntityKeyString( target ) ?? 'unknown' ] as const;
};

const readerPostEntityQueryKeyFromString = ( keyString: string ): ReaderPostEntityQueryKey => {
	return [ 'read', 'post', 'entity', keyString ] as const;
};

const mergeReaderPost = (
	base: ReaderPostEntityPost | null | undefined,
	patch: ReaderPostEntityPost | null | undefined
): ReaderPostEntityPost => {
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
						...( ( base.discussion as ReaderPostEntityPost | undefined ) ?? {} ),
						...( ( patch.discussion as ReaderPostEntityPost | undefined ) ?? {} ),
					},
			  }
			: {} ),
	};
};

const mergeReaderPostEntityData = (
	data: ReaderPostEntityData | null | undefined
): ReaderPostEntityPost | null => {
	if ( ! data ) {
		return null;
	}
	return mergeReaderPost( data.base, data.overlay );
};

const ensureReaderPostEntityQueryDefaults = ( queryClient: QueryClient ) => {
	queryClient.setQueryDefaults(
		READER_POST_ENTITY_QUERY_KEY_PREFIX,
		READER_POST_ENTITY_QUERY_OPTIONS
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

const postMatchesKey = ( post: ReaderPostEntityPost, key: ReaderPostEntityKey ): boolean => {
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

const postsShareIdentity = ( left: ReaderPostEntityPost, right: ReaderPostEntityPost ): boolean => {
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

const entityMatchesTarget = (
	entity: ReaderPostEntityPost,
	target: ReaderPostEntityTarget
): boolean => {
	if ( ! target ) {
		return false;
	}
	if ( isReaderPostEntityKey( target ) ) {
		return postMatchesKey( entity, target );
	}
	return postsShareIdentity( entity, target );
};

const getMatchingEntityKeyStrings = (
	queryClient: QueryClient,
	target: ReaderPostEntityTarget
): string[] => {
	const matchingKeyStrings = new Set< string >();
	const targetKeyString = readerPostEntityKeyString( target );
	const targetQueryData = targetKeyString
		? queryClient.getQueryData< ReaderPostEntityData >(
				readerPostEntityQueryKeyFromString( targetKeyString )
		  )
		: null;

	if ( targetQueryData ) {
		matchingKeyStrings.add( targetKeyString as string );
	}

	const entityQueries = queryClient.getQueriesData< ReaderPostEntityData >( {
		queryKey: READER_POST_ENTITY_QUERY_KEY_PREFIX,
	} );

	for ( const [ queryKey, current ] of entityQueries ) {
		const merged = mergeReaderPostEntityData( current );
		const keyString = ( queryKey as ReaderPostEntityQueryKey )[ 3 ];
		if ( merged && keyString && entityMatchesTarget( merged, target ) ) {
			matchingKeyStrings.add( keyString );
		}
	}

	return [ ...matchingKeyStrings ];
};

export const upsertReaderPostEntities = (
	queryClient: QueryClient,
	posts: Array< ReaderPostEntityPost | null | undefined >
) => {
	ensureReaderPostEntityQueryDefaults( queryClient );

	const validPosts = posts.filter( Boolean ) as ReaderPostEntityPost[];
	const keyStringsByPost = new Map(
		validPosts.map( ( post ) => [ post, new Set( postKeyStringsFromPost( post ) ) ] )
	);
	const entityQueries = queryClient.getQueriesData< ReaderPostEntityData >( {
		queryKey: READER_POST_ENTITY_QUERY_KEY_PREFIX,
	} );

	for ( const [ queryKey, current ] of entityQueries ) {
		const merged = mergeReaderPostEntityData( current );
		const keyString = ( queryKey as ReaderPostEntityQueryKey )[ 3 ];
		if ( ! merged || ! keyString ) {
			continue;
		}

		validPosts.forEach( ( post ) => {
			if ( entityMatchesTarget( merged, post ) ) {
				keyStringsByPost.get( post )?.add( keyString );
			}
		} );
	}

	validPosts.forEach( ( post ) => {
		keyStringsByPost.get( post )?.forEach( ( keyString ) => {
			queryClient.setQueryData< ReaderPostEntityData >(
				readerPostEntityQueryKeyFromString( keyString ),
				( current ) => ( {
					base: mergeReaderPost( current?.base, post ),
					overlay: current?.overlay ?? {},
				} )
			);
		} );
	} );
};

export const getReaderPostEntity = (
	queryClient: QueryClient,
	target: ReaderPostEntityTarget
): ReaderPostEntityPost | null => {
	const keyString = readerPostEntityKeyString( target );
	if ( ! keyString ) {
		return null;
	}
	return (
		mergeReaderPostEntityData(
			queryClient.getQueryData< ReaderPostEntityData >( readerPostEntityQueryKey( target ) )
		) ?? null
	);
};

export const updateReaderPostLocalState = (
	queryClient: QueryClient,
	target: ReaderPostEntityTarget,
	patch: ( post: ReaderPostEntityPost | null ) => ReaderPostEntityPost
) => {
	ensureReaderPostEntityQueryDefaults( queryClient );

	getMatchingEntityKeyStrings( queryClient, target ).forEach( ( keyString ) => {
		queryClient.setQueryData< ReaderPostEntityData >(
			readerPostEntityQueryKeyFromString( keyString ),
			( current ) => {
				const merged = mergeReaderPostEntityData( current );
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

export const updateReaderPostLocalStateMatching = (
	queryClient: QueryClient,
	predicate: ( post: ReaderPostEntityPost ) => boolean,
	patch: ( post: ReaderPostEntityPost ) => ReaderPostEntityPost
) => {
	ensureReaderPostEntityQueryDefaults( queryClient );

	const entityQueries = queryClient.getQueriesData< ReaderPostEntityData >( {
		queryKey: READER_POST_ENTITY_QUERY_KEY_PREFIX,
	} );

	for ( const [ queryKey, current ] of entityQueries ) {
		const merged = mergeReaderPostEntityData( current );
		if ( ! merged || ! predicate( merged ) ) {
			continue;
		}

		queryClient.setQueryData< ReaderPostEntityData >( queryKey, {
			base: current?.base ?? {},
			overlay: mergeReaderPost( current?.overlay, patch( merged ) ),
		} );
	}
};

export const useReaderPostEntity = (
	target: ReaderPostEntityTarget
): ReaderPostEntityPost | null => {
	const query = useQuery< ReaderPostEntityData | null >( {
		queryKey: readerPostEntityQueryKey( target ),
		queryFn: () => Promise.resolve( null ),
		enabled: false,
		...READER_POST_ENTITY_QUERY_OPTIONS,
	} );

	return useMemo( () => mergeReaderPostEntityData( query.data ), [ query.data ] );
};
