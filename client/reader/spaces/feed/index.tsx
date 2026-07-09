import { isDefaultLocale } from '@automattic/i18n-utils';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { useInfiniteStream } from 'calypso/reader/data/stream';
import { ScrollDebugOverlay } from 'calypso/reader/hooks/use-infinite-list';
import { keyForPost, keysAreEqual } from 'calypso/reader/post-key';
import { useSelectedPostCommands } from 'calypso/reader/stream/use-selected-post-commands';
import { useStreamKeyboardShortcuts } from 'calypso/reader/stream/use-stream-keyboard-shortcuts';
import { useStreamPostKeySelection } from 'calypso/reader/stream/use-stream-post-key-selection';
import { useDispatch } from 'calypso/state';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import isNotificationsOpen from 'calypso/state/selectors/is-notifications-open';
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
import type { ReadSpace, ReadStreamPost } from '@automattic/api-core';

import './style.scss';

interface Props {
	// The space, already resolved by the view (list summary or by-slug detail). Only
	// its `id` (keys the streams) and `layout` (selects the layout) are read here, so
	// the summary shape is enough — no re-fetch by id.
	space: ReadSpace;
	// Retry the space detail; backs the stream error state's retry alongside the
	// stream's own refetch. Owned by the view (the by-slug query's `refetch`).
	onRetrySpace?: () => void;
	// Which per-space stream to render: the posts feed (`space:<id>`, followed
	// feeds + tags) or Discover (`space_discover:<id>`, recommended on-topic posts
	// the user doesn't follow). Both share this shell and the same layouts.
	variant?: 'feed' | 'discover';
	// Opens the Customize modal's Sources tab; wired to the Feed empty-state CTA.
	onAddSources?: () => void;
}

/**
 * A space's stream surface, shared by both tabs. The `variant` selects the
 * per-space stream — the posts feed (`/reader/spaces/<id>/posts`, keyed
 * `space:<id>`, built server-side from the space's followed feeds and tags) or
 * Discover (`/reader/spaces/<id>/discover`, keyed `space_discover:<id>`,
 * recommended on-topic posts the user doesn't follow). The space detail is resolved
 * once by the view (from the URL slug) and passed in: its numeric `id` keys the
 * stream (`space:<id>`) and `layout.view` selects the layout. Both variants share
 * the same layouts.
 */
export function SpaceFeed( { space, onRetrySpace, variant = 'feed', onAddSources }: Props ) {
	const spaceId = space.id;
	const layout = space.layout.view ?? DEFAULT_SPACE_FEED_LAYOUT;

	// The Space's own stream. Keyed by the route's `spaceId` (not gated on the
	// detail), so it fetches immediately, in parallel with the detail. The legacy
	// layout (ReaderStreamV2) fetches the same key itself; React Query dedupes, so
	// the shell skips its fetch there to avoid recomputing `items` it never uses.
	const isDiscover = variant === 'discover';
	const streamKey = isDiscover ? `space_discover:${ spaceId }` : `space:${ spaceId }`;
	const isLegacy = layout === 'legacy';
	const dispatch = useDispatch();
	const rawLocale = useSelector( getCurrentLocaleSlug );
	const localeSlug = rawLocale && ! isDefaultLocale( rawLocale ) ? rawLocale : null;
	const stream = useInfiniteStream( {
		streamKey,
		localeSlug,
		perPage: getLayoutPageSize( layout ),
		options: { enabled: ! isLegacy },
	} );
	// The shell only needs the stream's posts for the list's structure and ordering
	// (parsed by the stream hook); each card reads its own normalized post from the
	// cache (see the card components).
	const posts = stream.posts;

	const { selectedPostKey, selectPostKey, selectNextPost, selectPreviousPost } =
		useStreamPostKeySelection( { streamKey, localeSlug, items: stream.items } );
	const isPostSelected = useCallback(
		( post: ReadStreamPost ) =>
			selectedPostKey != null && keysAreEqual( keyForPost( post ), selectedPostKey ),
		[ selectedPostKey ]
	);
	const selectPost = useCallback(
		( post: ReadStreamPost ) => {
			const postKey = keyForPost( post );
			if ( postKey ) {
				const streamItem = stream.items.find(
					( item ) => keysAreEqual( item, postKey ) || keysAreEqual( item.xPostMetadata, postKey )
				);
				selectPostKey( streamItem ?? postKey );
			}
			dispatch(
				recordReaderTracksEvent(
					'calypso_reader_spaces_post_opened',
					{ space_id: spaceId, layout, variant },
					{ post }
				)
			);
		},
		[ dispatch, selectPostKey, stream.items, spaceId, layout, variant ]
	);

	const notificationsOpen = useSelector( isNotificationsOpen );
	const { openSelected, openSelectedInNewTab, toggleSelectedLike } =
		useSelectedPostCommands( selectedPostKey );

	// Reading shortcuts for the curated layouts (the shell owns their selection).
	// The legacy layout's ReaderStreamV2 registers its own set, so gate on
	// `! isLegacy` to avoid a double handler on the same keys.
	useStreamKeyboardShortcuts( {
		enabled: ! isLegacy && ! notificationsOpen,
		onNext: selectNextPost,
		onPrevious: selectPreviousPost,
		onOpen: openSelected,
		onOpenInNewTab: openSelectedInNewTab,
		onToggleLike: toggleSelectedLike,
	} );

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
					isPostSelected={ isPostSelected }
					selectPost={ selectPost }
					showTimestamp={ ! isDiscover }
					emptyContent={ <SpaceFeedEmpty variant={ variant } onAddSources={ onAddSources } /> }
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
						onRetrySpace?.();
						stream.refetch();
					} }
				/>
			);
		}
		if ( posts.length === 0 ) {
			return <SpaceFeedEmpty variant={ variant } onAddSources={ onAddSources } />;
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
				isPostSelected={ isPostSelected }
				selectPost={ selectPost }
				showTimestamp={ ! isDiscover }
			/>
		);
	};

	return (
		<div
			className={ clsx(
				'space-feed',
				space.layout.color !== 'none' && `space-feed--${ space.layout.color }`
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
