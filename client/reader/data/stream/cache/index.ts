import {
	getStreamInfiniteQueryKeyPrefix,
	getStreamType,
	parseStreamInfiniteQueryKey,
	type PageHandle,
	type StreamIdentity,
} from '@automattic/api-queries';
import { type InfiniteData, type QueryClient } from '@tanstack/react-query';
import { keysAreEqual } from 'calypso/reader/post-key';
import { normalizeStreamPage } from '../normalization';
import { combineXPosts } from '../utils';
import type { StreamItem } from '../types';
import type { ReadStreamResponse } from '@automattic/api-core';

type CachedStreamItemsOptions = Partial< StreamIdentity > & {
	streamKey: string;
	currentPostKey?: StreamItem | null;
};

const streamItemsAreEqual = ( currentItem: StreamItem | undefined, item: StreamItem ): boolean =>
	!! currentItem &&
	( keysAreEqual( currentItem, item ) || keysAreEqual( currentItem.xPostMetadata, item ) );

const removeItemFromPage = (
	page: ReadStreamResponse,
	streamType: string,
	item: StreamItem
): ReadStreamResponse => {
	const { streamItems } = normalizeStreamPage( page, streamType );
	if ( ! streamItems.some( ( streamItem ) => streamItemsAreEqual( streamItem, item ) ) ) {
		return page;
	}

	if ( Array.isArray( page.posts ) ) {
		const posts = page.posts.filter(
			( _post, index ) => ! streamItemsAreEqual( streamItems[ index ], item )
		);
		return posts.length === page.posts.length ? page : { ...page, posts };
	}

	if ( Array.isArray( page.cards ) ) {
		let streamItemIndex = 0;
		const cards = page.cards.filter( ( card ) => {
			if ( card.type !== 'post' ) {
				return true;
			}
			const shouldKeep = ! streamItemsAreEqual( streamItems[ streamItemIndex ], item );
			streamItemIndex++;
			return shouldKeep;
		} );
		return cards.length === page.cards.length ? page : { ...page, cards };
	}

	return page;
};

export const removeStreamItemFromCache = (
	queryClient: QueryClient,
	{ streamKey, item }: { streamKey: string; item: StreamItem }
) => {
	const streamType = getStreamType( streamKey );
	queryClient.setQueriesData< InfiniteData< ReadStreamResponse, PageHandle > >(
		{ queryKey: getStreamInfiniteQueryKeyPrefix( streamKey ) },
		( current ) => {
			if ( ! current ) {
				return current;
			}

			let didChange = false;
			const pages = current.pages.map( ( page ) => {
				const nextPage = removeItemFromPage( page, streamType, item );
				didChange = didChange || nextPage !== page;
				return nextPage;
			} );

			return didChange ? { ...current, pages } : current;
		}
	);
};

const getItemsForPages = ( pages: ReadStreamResponse[], streamKey: string ): StreamItem[] => {
	const streamType = getStreamType( streamKey );
	const collected: StreamItem[] = [];
	for ( const page of pages ) {
		collected.push( ...normalizeStreamPage( page, streamType ).streamItems );
	}
	return combineXPosts( collected ) as StreamItem[];
};

const containsStreamItem = ( items: StreamItem[], item: StreamItem ): boolean =>
	items.some(
		( currentItem ) =>
			keysAreEqual( currentItem, item ) || keysAreEqual( currentItem.xPostMetadata, item )
	);

export const getCachedStreamItems = (
	queryClient: QueryClient,
	{
		streamKey,
		feedId = null,
		localeSlug = null,
		startDate = null,
		currentPostKey = null,
	}: CachedStreamItemsOptions
): StreamItem[] => {
	const cachedEntries = queryClient.getQueriesData<
		InfiniteData< ReadStreamResponse, PageHandle >
	>( {
		queryKey: getStreamInfiniteQueryKeyPrefix( streamKey ),
	} );
	if ( cachedEntries.length === 0 ) {
		return [];
	}

	const itemsForEntry = ( entry: ( typeof cachedEntries )[ number ] | undefined ): StreamItem[] => {
		const pages = entry?.[ 1 ]?.pages ?? [];
		return getItemsForPages( pages, streamKey );
	};

	const exactEntry = cachedEntries.find( ( [ queryKey ] ) => {
		const identity = parseStreamInfiniteQueryKey( queryKey );
		return (
			!! identity &&
			identity.feedId === feedId &&
			identity.localeSlug === localeSlug &&
			identity.startDate === startDate
		);
	} );
	if ( exactEntry ) {
		return itemsForEntry( exactEntry );
	}

	if ( currentPostKey ) {
		for ( const entry of cachedEntries ) {
			const items = itemsForEntry( entry );
			if ( containsStreamItem( items, currentPostKey ) ) {
				return items;
			}
		}
	}

	const localeMatchedEntry = cachedEntries.find(
		( [ queryKey ] ) => parseStreamInfiniteQueryKey( queryKey )?.localeSlug === localeSlug
	);
	return itemsForEntry( localeMatchedEntry ?? cachedEntries[ 0 ] );
};
