import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
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
import {
	DEFAULT_SPACE_FEED_LAYOUT,
	getLayout,
	getLayoutInlineLoadMore,
	getLayoutPageSize,
	getLayoutSkeleton,
} from './layouts/registry';
import type { ReadStreamPost, ReadStreamResponse, SpaceFeedLayout } from '@automattic/api-core';

import './style.scss';

interface Props {
	spaceId: string;
	layoutView?: SpaceFeedLayout;
	// Which per-space stream to render: the posts feed (`space:<id>`, followed
	// feeds + tags) or Discover (`space_discover:<id>`, recommended on-topic posts
	// the user doesn't follow). Both share this shell and the same layouts.
	variant?: 'feed' | 'discover';
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
 * A space's stream surface, shared by both tabs. The `variant` selects the
 * per-space stream — the posts feed (`/reader/spaces/<id>/posts`, keyed
 * `space:<id>`, built server-side from the space's followed feeds and tags) or
 * Discover (`/reader/spaces/<id>/discover`, keyed `space_discover:<id>`,
 * recommended on-topic posts the user doesn't follow). The stream is keyed by the
 * route's `spaceId`, so it loads in parallel with the space detail rather than
 * waiting for it. The detail only refines the layout (`space.layout.view`, chosen
 * via the Customize modal); `layoutView` — the summary value from the spaces list
 * — is the layout while the detail is still loading or missing that field. Both
 * variants share the same layouts.
 */
export function SpaceFeed( { spaceId, layoutView, variant = 'feed' }: Props ) {
	// The detail loads in parallel with the stream and only refines the layout, so
	// the feed never blocks on it. `refetchSpace` backs the stream's retry.
	const { data: space, refetch: refetchSpace } = useSpace( spaceId );
	const layout = space?.layout.view ?? layoutView ?? DEFAULT_SPACE_FEED_LAYOUT;

	// The Space's own stream. Keyed by the route's `spaceId` (not gated on the
	// detail), so it fetches immediately, in parallel with the detail. The legacy
	// layout (ReaderStreamV2) fetches the same key itself; React Query dedupes, so
	// the shell skips its fetch there to avoid recomputing `items` it never uses.
	const isDiscover = variant === 'discover';
	const streamKey = isDiscover ? `space_discover:${ spaceId }` : `space:${ spaceId }`;
	const isLegacy = layout === 'legacy';
	const stream = useInfiniteStream( {
		streamKey,
		perPage: getLayoutPageSize( layout ),
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
	const Skeleton = getLayoutSkeleton( layout );
	// Some layouts (the gallery) render their own load-more placeholders inline, so
	// the shell skips the foot skeleton for them while still announcing the load.
	const inlineLoadMore = getLayoutInlineLoadMore( layout );
	const translate = useTranslate();
	// A page's worth of placeholder cards for the first load; a few at the foot
	// while the next page loads.
	const initialSkeletonCount = getLayoutPageSize( layout ) ?? 8;
	const loadMoreSkeletonCount = 3;

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
					restoreKey={ `${ spaceId }:${ variant }:${ layout }` }
				/>
			);
		}
		// The feed is driven by the posts stream, which loads in parallel with the
		// space detail — it never waits on the detail to show posts.
		if ( stream.isLoading ) {
			if ( ! Skeleton ) {
				return <SpaceFeedLoading />;
			}
			return (
				<div role="status" aria-busy="true">
					<span className="screen-reader-text">{ translate( 'Loading the feed…' ) }</span>
					<Skeleton count={ initialSkeletonCount } />
				</div>
			);
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
			return <SpaceFeedEmpty variant={ variant } />;
		}
		return (
			<Layout
				posts={ posts }
				streamKey={ streamKey }
				scrollElement={ scrollElement }
				hasMore={ stream.hasNextPage }
				isLoadingMore={ stream.isFetchingNextPage }
				loadMore={ stream.fetchNextPage }
				restoreKey={ `${ spaceId }:${ variant }:${ layout }` }
			/>
		);
	};

	return (
		<div
			className={ clsx(
				'space-feed',
				space && space.layout.color !== 'none' && `space-feed--${ space.layout.color }`
			) }
		>
			{ /* The source notice reports followed-feed failures; Discover isn't built
			     from followed feeds, so it only applies to the posts feed. */ }
			{ ! isDiscover && <SpaceFeedSourceNotice failedCount={ 0 } /> }
			<div className="space-feed__viewport" ref={ setViewport }>
				{ renderBody() }
				{ showLoadingMore &&
					( Skeleton ? (
						<div className="space-feed__loading-more" role="status" aria-busy="true">
							<span className="screen-reader-text">{ translate( 'Loading more posts…' ) }</span>
							{ ! inlineLoadMore && <Skeleton count={ loadMoreSkeletonCount } /> }
						</div>
					) : (
						<SpaceFeedLoadingMore />
					) ) }
			</div>
			<ScrollDebugOverlay scrollElement={ scrollElement } />
		</div>
	);
}
