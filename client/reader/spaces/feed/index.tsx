import { useCallback, useMemo, useState } from 'react';
import { useSpace } from 'calypso/reader/data/spaces';
import { useInfiniteStream } from 'calypso/reader/data/stream';
import { ScrollDebugOverlay } from 'calypso/reader/hooks/use-infinite-list';
import { SpaceFeedSourceNotice } from './components/source-notice';
import {
	SpaceFeedEmpty,
	SpaceFeedError,
	SpaceFeedLoading,
	SpaceFeedLoadingMore,
} from './components/states';
import { DEFAULT_SPACE_FEED_LAYOUT, getLayout } from './layouts/registry';
import type { ReadStreamPost, ReadStreamResponse, SpaceFeedLayout } from '@automattic/api-core';

import './style.scss';

interface Props {
	spaceId: string;
	layoutView?: SpaceFeedLayout;
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
 * The space feed. The posts stream (`/reader/spaces/<id>/posts`, keyed
 * `space:<id>`, built server-side from the space's followed feeds and tags) is
 * keyed by the route's `spaceId`, so it loads in parallel with the space detail
 * rather than waiting for it. The detail only refines the layout
 * (`space.layout.view`, chosen via the Customize modal); `layoutView` — the
 * summary value from the spaces list — is the layout while the detail is still
 * loading or missing that field. Every layout reads that same per-space query.
 */
export function SpaceFeed( { spaceId, layoutView }: Props ) {
	// The detail loads in parallel with the stream and only refines the layout, so
	// the feed never blocks on it. `refetchSpace` backs the stream's retry.
	const { data: space, refetch: refetchSpace } = useSpace( spaceId );
	const layout = space?.layout.view ?? layoutView ?? DEFAULT_SPACE_FEED_LAYOUT;

	// The Space's own posts feed. Keyed by the route's `spaceId` (not gated on the
	// detail), so it fetches immediately, in parallel with the detail. The legacy
	// layout (ReaderStreamV2) fetches the same key itself; React Query dedupes, so
	// the shell skips its fetch there to avoid recomputing `items` it never uses.
	const streamKey = `space:${ spaceId }`;
	const isLegacy = layout === 'legacy';
	const stream = useInfiniteStream( {
		streamKey,
		options: { enabled: ! isLegacy },
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
		// The feed is driven by the posts stream, which loads in parallel with the
		// space detail — it never waits on the detail to show posts.
		if ( stream.isLoading ) {
			return <SpaceFeedLoading />;
		}
		if ( stream.error ) {
			// A stream failure can also stem from a stale/broken detail, so retry both.
			return (
				<SpaceFeedError
					onRetry={ () => {
						refetchSpace();
						stream.refetch();
					} }
				/>
			);
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
