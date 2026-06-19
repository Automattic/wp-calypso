import { useCallback, useMemo, useState } from 'react';
import { useSpace } from 'calypso/reader/data/spaces';
import { useInfiniteStream } from 'calypso/reader/data/stream';
import { RECOMMENDED_TAB, buildDiscoverStreamKey } from 'calypso/reader/discover/helper';
import { ScrollDebugOverlay } from 'calypso/reader/hooks/use-infinite-list';
import { SpaceFeedSourceNotice } from './components/source-notice';
import {
	SpaceFeedEmpty,
	SpaceFeedError,
	SpaceFeedLoading,
	SpaceFeedLoadingMore,
} from './components/states';
import { DEFAULT_SPACE_FEED_LAYOUT, getLayout } from './layouts/registry';
import type { ReadStreamPost, ReadStreamResponse } from '@automattic/api-core';

import './style.scss';

interface Props {
	spaceId: string;
}

export function collectPosts( pages: ReadStreamResponse[] ): ReadStreamPost[] {
	const posts: ReadStreamPost[] = [];
	for ( const page of pages ) {
		if ( page.cards?.length ) {
			for ( const card of page.cards ) {
				if ( card.type === 'post' ) {
					posts.push( card.data );
				}
			}
		} else if ( page.posts?.length ) {
			posts.push( ...page.posts );
		}
	}
	return posts;
}

/**
 * The space feed. Loads the space detail first, then derives the feed from it:
 * the layout from `space.layout.view` (chosen via the Customize modal) and the
 * stream from the space's `tags` (a discover `recommended` query). Every layout
 * reads that same per-space query.
 */
export function SpaceFeed( { spaceId }: Props ) {
	const {
		data: space,
		error: spaceError,
		isLoading: isSpaceLoading,
		refetch: refetchSpace,
	} = useSpace( spaceId );
	const layout = space?.layout.view ?? DEFAULT_SPACE_FEED_LAYOUT;

	// The stream is the discover `recommended` feed for the space's tags, so it
	// can't be built until the detail (which carries `tags`) has loaded. The
	// legacy layout (ReaderStreamV2) fetches the same key itself; React Query
	// dedupes, so we skip the shell's fetch there to avoid recomputing `items` it
	// never uses — same query, fetched once.
	const streamKey = space ? buildDiscoverStreamKey( RECOMMENDED_TAB, space.tags ) : '';
	const isLegacy = layout === 'legacy';
	const stream = useInfiniteStream( {
		streamKey,
		options: { enabled: Boolean( space ) && ! isLegacy },
	} );
	const posts = useMemo( () => collectPosts( stream.pages ), [ stream.pages ] );

	// Scroll on the Reader's main bounded container (`.layout__primary > div`, which
	// has a fixed height) — the same scrollbar the rest of the Reader uses — instead
	// of a nested viewport. The virtualizer needs a height-bounded element here: an
	// unbounded one reports clientHeight ≈ scrollHeight, so it thinks every item is
	// visible and renders the whole list (and infinite-loads every page). Resolve it
	// from the rendered viewport (held in state via a callback ref so the virtualizer
	// re-measures once it is attached) and hand it to the layout. Use `?scroll-debug`
	// to highlight the resolved container (see ScrollDebugOverlay).
	const [ scrollElement, setScrollElement ] = useState< HTMLElement | null >( null );
	const setViewport = useCallback( ( element: HTMLDivElement | null ) => {
		setScrollElement(
			element ? element.closest< HTMLElement >( '.layout__primary > div' ) ?? element : null
		);
	}, [] );
	const Layout = getLayout( layout );

	// Skeleton at the foot of the list while the next page loads. Sits below the
	// virtualized content (which fills the viewport's scroll height) so it shows
	// at the bottom, where `loadMore` is triggered, for every layout.
	const showLoadingMore = posts.length > 0 && ! stream.error && stream.isFetchingNextPage;

	const renderBody = () => {
		// Load the space detail before anything else — the stream key is derived
		// from its tags, and the layout from its `view`.
		if ( ! space && spaceError ) {
			return <SpaceFeedError onRetry={ refetchSpace } />;
		}
		if ( isSpaceLoading || ! space ) {
			return <SpaceFeedLoading />;
		}
		// Legacy renders ReaderStreamV2, which fetches its own data; it only needs
		// the stream key, scroll container, and restoreKey from the shell.
		if ( isLegacy ) {
			return (
				<Layout
					posts={ [] }
					streamKey={ streamKey }
					scrollElement={ scrollElement }
					hasMore={ false }
					isLoadingMore={ false }
					loadMore={ () => {} }
					restoreKey={ `${ spaceId }:${ layout }` }
				/>
			);
		}
		if ( stream.isLoading ) {
			return <SpaceFeedLoading />;
		}
		if ( stream.error ) {
			return <SpaceFeedError onRetry={ stream.refetch } />;
		}
		if ( posts.length === 0 ) {
			return <SpaceFeedEmpty />;
		}
		return (
			<Layout
				posts={ posts }
				streamKey={ streamKey }
				scrollElement={ scrollElement }
				hasMore={ stream.hasNextPage }
				isLoadingMore={ stream.isFetchingNextPage }
				loadMore={ stream.fetchNextPage }
				restoreKey={ `${ spaceId }:${ layout }` }
			/>
		);
	};

	return (
		<div className="space-feed">
			<SpaceFeedSourceNotice failedCount={ 0 } />
			<div className="space-feed__viewport" ref={ setViewport }>
				{ renderBody() }
				{ showLoadingMore && <SpaceFeedLoadingMore /> }
			</div>
			<ScrollDebugOverlay scrollElement={ scrollElement } />
		</div>
	);
}
